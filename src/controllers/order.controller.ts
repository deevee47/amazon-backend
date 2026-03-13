import type { Request, Response, NextFunction } from "express";
import * as OrderService from "../services/order.service.ts";
import { AppError } from "../types/index.ts";
import type { PlaceOrderBody } from "../types/index.ts";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function paymentLabel(method: string) {
  if (method === "cod") return "Cash on Delivery";
  if (method === "card") return "Credit/Debit Card";
  if (method === "upi") return "UPI";
  return method;
}

function formatPrice(price: number | string) {
  return Number(price).toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

function buildEmailHtml(order: Awaited<ReturnType<typeof OrderService.placeOrder>>) {
  const addr = order.shippingAddress as Record<string, string> | null;
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #e7e7e7;">
        <img src="${item.thumbnail}" alt="${item.name}" width="60" style="vertical-align:middle;margin-right:12px;border-radius:4px;" />
        ${item.name}
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #e7e7e7;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #e7e7e7;text-align:right;">${formatPrice(item.price)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #e7e7e7;text-align:right;">${formatPrice(Number(item.price) * item.quantity)}</td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#EAEDED;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EAEDED;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#131921;padding:16px 24px;">
            <span style="color:#FF9900;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">amazon</span>
          </td>
        </tr>

        <!-- Success banner -->
        <tr>
          <td style="background:#067D62;padding:20px 24px;color:#fff;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:28px;padding-right:12px;">✓</td>
                <td>
                  <div style="font-size:18px;font-weight:bold;">Order Confirmed!</div>
                  <div style="font-size:13px;opacity:0.9;margin-top:2px;">Thank you. Your order has been placed successfully.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Order meta -->
        <tr>
          <td style="padding:16px 24px;background:#F8F8F8;border-bottom:1px solid #e7e7e7;">
            <span style="font-size:13px;color:#555;">Order ID: </span>
            <span style="font-size:13px;font-family:monospace;font-weight:bold;color:#0F1111;">#${order.id}</span>
            &nbsp;&nbsp;
            <span style="font-size:13px;color:#555;">${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="padding:24px;">
            <div style="font-size:15px;font-weight:bold;color:#0F1111;margin-bottom:12px;">Items Ordered</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7e7e7;border-radius:6px;overflow:hidden;">
              <thead>
                <tr style="background:#F0F2F2;">
                  <th style="padding:10px 8px;text-align:left;font-size:12px;color:#555;font-weight:600;">Product</th>
                  <th style="padding:10px 8px;text-align:center;font-size:12px;color:#555;font-weight:600;">Qty</th>
                  <th style="padding:10px 8px;text-align:right;font-size:12px;color:#555;font-weight:600;">Price</th>
                  <th style="padding:10px 8px;text-align:right;font-size:12px;color:#555;font-weight:600;">Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
          </td>
        </tr>

        <!-- Address + Payment -->
        <tr>
          <td style="padding:0 24px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="vertical-align:top;padding-right:8px;">
                  <div style="border:1px solid #e7e7e7;border-radius:6px;padding:16px;">
                    <div style="font-size:13px;font-weight:bold;color:#0F1111;margin-bottom:8px;">Delivery Address</div>
                    ${addr ? `
                    <div style="font-size:13px;color:#333;line-height:1.6;">
                      ${addr.name}<br/>
                      ${addr.line1}<br/>
                      ${addr.city}, ${addr.state} ${addr.zip}<br/>
                      ${addr.phone}
                    </div>` : ""}
                  </div>
                </td>
                <td width="50%" style="vertical-align:top;padding-left:8px;">
                  <div style="border:1px solid #e7e7e7;border-radius:6px;padding:16px;">
                    <div style="font-size:13px;font-weight:bold;color:#0F1111;margin-bottom:8px;">Payment</div>
                    <div style="font-size:13px;color:#333;">💳 ${paymentLabel(order.paymentMethod)}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Order total -->
        <tr>
          <td style="padding:0 24px 24px;">
            <div style="border:1px solid #e7e7e7;border-radius:6px;padding:16px;">
              <div style="font-size:13px;font-weight:bold;color:#0F1111;margin-bottom:12px;">Order Summary</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#555;padding:3px 0;">Items total:</td>
                  <td style="font-size:13px;color:#555;text-align:right;">${formatPrice(order.amount)}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#555;padding:3px 0;">Shipping:</td>
                  <td style="font-size:13px;color:#067D62;text-align:right;font-weight:600;">FREE</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-top:1px solid #e7e7e7;padding-top:8px;margin-top:8px;"></td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:bold;color:#0F1111;">Order Total:</td>
                  <td style="font-size:15px;font-weight:bold;color:#0F1111;text-align:right;">${formatPrice(order.amount)}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F0F2F2;padding:16px 24px;text-align:center;font-size:12px;color:#777;border-top:1px solid #e7e7e7;">
            Thank you for shopping with us!
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function placeOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, shippingAddress, paymentMethod, items } = req.body as PlaceOrderBody;

    if (!email) throw new AppError("email is required", 400);
    if (!shippingAddress) throw new AppError("shippingAddress is required", 400);
    if (!shippingAddress.name) throw new AppError("shippingAddress.name is required", 400);
    if (!shippingAddress.phone) throw new AppError("shippingAddress.phone is required", 400);
    if (!shippingAddress.line1) throw new AppError("shippingAddress.line1 is required", 400);
    if (!shippingAddress.city) throw new AppError("shippingAddress.city is required", 400);
    if (!shippingAddress.zip) throw new AppError("shippingAddress.zip is required", 400);
    if (!paymentMethod) throw new AppError("paymentMethod is required", 400);
    if (!["cod", "card", "upi"].includes(paymentMethod)) {
      throw new AppError("paymentMethod must be one of: cod, card, upi", 400);
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("items must be a non-empty array", 400);
    }

    const order = await OrderService.placeOrder({ email, shippingAddress, paymentMethod, items });

    // Send confirmation email (fire-and-forget — don't block the response)
    resend.emails.send({
      from: "Divyansh Vishwakarma Amazon Clone <onboarding@resend.dev>",
      to: email,
      subject: `Order Confirmed — #${order.id}`,
      html: buildEmailHtml(order),
    }).catch((err) => console.error("[Email Error]", err));

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export async function getOrderHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.query as { email?: string };

    const orders = await OrderService.findOrdersByEmail(email);
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) throw new AppError("Order ID is required", 400);

    const order = await OrderService.findOrderById(id);
    if (!order) throw new AppError("Order not found", 404);

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

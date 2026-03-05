import React from "react";
import PolicyLayout from "./PolicyLayout";
import { FaUndo } from "react-icons/fa";

const RefundPolicy = () => {
  return (
    <PolicyLayout title="Refund Policy" icon={FaUndo}>
      <p>
        At <strong>JJ Trendz Official</strong>, we want you to be completely satisfied with your purchase.
        This Refund Policy outlines the conditions under which you can return products and receive a refund.
      </p>

      <h2>Return Eligibility</h2>
      <p>Items are eligible for return if they meet the following criteria:</p>
      <ul>
        <li>Return request is made within <strong>7 days</strong> of delivery</li>
        <li>Product is unused, unwashed, and in original condition</li>
        <li>All original tags and packaging are intact</li>
        <li>Product is not damaged due to customer mishandling</li>
        <li>Proof of purchase (order confirmation or invoice) is provided</li>
      </ul>

      <h2>Non-Returnable Items</h2>
      <p>The following items cannot be returned or refunded:</p>
      <ul>
        <li>Customized or personalized sarees</li>
        <li>Stitched blouses or altered products</li>
        <li>Products marked as "Final Sale" or "Non-Returnable"</li>
        <li>Items damaged due to improper use or washing</li>
        <li>Products with removed tags or altered packaging</li>
        <li>Intimate wear and accessories for hygiene reasons</li>
      </ul>

      <h2>Order Cancellation</h2>
      <p>You can cancel your order under the following conditions:</p>
      <ul>
        <li><strong>Before Shipment:</strong> Orders can be cancelled within 24 hours of placement if not yet shipped. Full refund will be processed.</li>
        <li><strong>After Shipment:</strong> Once the order is shipped, cancellation is not possible. You may initiate a return after receiving the product.</li>
      </ul>

      <h2>How to Initiate a Return</h2>
      <p>To initiate a return, please follow these steps:</p>
      <ol>
        <li>Log in to your account and go to "My Orders"</li>
        <li>Select the order containing the item you wish to return</li>
        <li>Click on "Request Return" and select the reason</li>
        <li>Upload clear photos of the product (if required)</li>
        <li>Submit the return request</li>
        <li>Our team will review and respond within 24-48 hours</li>
      </ol>
      <p>Alternatively, you can contact us at <strong>info@jjtrendz.com</strong> or call <strong>+91 88072 59471</strong>.</p>

      <h2>Return Shipping</h2>
      <ul>
        <li><strong>Defective/Wrong Items:</strong> We will arrange free pickup or reimburse shipping costs</li>
        <li><strong>Change of Mind:</strong> Customer bears the return shipping cost</li>
        <li>Products must be securely packed to prevent damage during transit</li>
        <li>We recommend using a trackable shipping service</li>
      </ul>

      <h2>Refund Process</h2>
      <p>Once we receive and inspect the returned item:</p>
      <ul>
        <li>Inspection takes 2-3 business days after receiving the return</li>
        <li>You will be notified of the refund approval via email</li>
        <li>Approved refunds are processed within <strong>5-7 business days</strong></li>
        <li>Refund will be credited to the original payment method</li>
        <li>Bank processing time may add 3-5 additional days</li>
      </ul>

      <h2>Refund Methods</h2>
      <ul>
        <li><strong>Online Payments:</strong> Refund to original payment method (Credit/Debit Card, UPI, Net Banking)</li>
        <li><strong>Cash on Delivery:</strong> Refund via bank transfer (NEFT/IMPS) - bank details required</li>
        <li><strong>Wallet Credit:</strong> Option to receive store credit for future purchases (instant processing)</li>
      </ul>

      <h2>Exchange Policy</h2>
      <p>We currently do not offer direct exchanges. If you wish to exchange a product:</p>
      <ol>
        <li>Initiate a return for the original item</li>
        <li>Place a new order for the desired item</li>
        <li>Refund for the returned item will be processed separately</li>
      </ol>

      <h2>Damaged or Defective Items</h2>
      <p>If you receive a damaged or defective product:</p>
      <ul>
        <li>Report within 48 hours of delivery with photos/videos</li>
        <li>Do not use or wash the product</li>
        <li>We will arrange replacement or full refund including shipping</li>
        <li>For manufacturing defects discovered later, contact us within 7 days</li>
      </ul>

      <h2>Contact Us</h2>
      <p>For any questions regarding returns and refunds, please reach out to us:</p>
      <ul>
        <li><strong>Email:</strong> info@jjtrendz.com</li>
        <li><strong>Phone:</strong> +91 88072 59471</li>
        <li><strong>WhatsApp:</strong> +91 88072 59471</li>
        <li><strong>Working Hours:</strong> Monday to Saturday, 10:00 AM - 7:00 PM IST</li>
      </ul>
    </PolicyLayout>
  );
};

export default RefundPolicy;

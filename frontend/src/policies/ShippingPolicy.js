import React from "react";
import PolicyLayout from "./PolicyLayout";
import { FaTruck } from "react-icons/fa";

const ShippingPolicy = () => {
  return (
    <PolicyLayout title="Shipping Policy" icon={FaTruck}>
      <p>
        At <strong>JJ Trendz Official</strong>, we are committed to delivering your beautiful fashion
        safely and on time. This Shipping Policy provides detailed information about our shipping
        process, delivery times, and charges.
      </p>

      <h2>Order Processing</h2>
      <ul>
        <li>Orders are processed within <strong>1-2 business days</strong> after payment confirmation</li>
        <li>Processing time excludes Sundays and public holidays</li>
        <li>You will receive an order confirmation email with order details</li>
        <li>Once shipped, you will receive tracking information via email and SMS</li>
      </ul>

      <h2>Domestic Shipping (Within India)</h2>
      <h3>Delivery Timeline</h3>
      <ul>
        <li><strong>Metro Cities:</strong> 3-5 business days (Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad)</li>
        <li><strong>Tier 2 Cities:</strong> 5-7 business days</li>
        <li><strong>Remote Areas:</strong> 7-10 business days</li>
        <li><strong>North East & J&K:</strong> 10-14 business days</li>
      </ul>

      <h3>Shipping Charges</h3>
      <ul>
        <li><strong>Free Shipping:</strong> On all orders above ₹999</li>
        <li><strong>Standard Shipping:</strong> ₹49 for orders below ₹999</li>
        <li>Remote area surcharge may apply for certain pin codes</li>
      </ul>

      <h2>International Shipping</h2>
      <p>We ship to select international destinations:</p>
      <ul>
        <li><strong>USA, UK, Canada, Australia:</strong> 10-15 business days</li>
        <li><strong>Middle East (UAE, Saudi Arabia, Qatar):</strong> 7-12 business days</li>
        <li><strong>Singapore, Malaysia:</strong> 7-10 business days</li>
        <li><strong>Europe:</strong> 12-18 business days</li>
      </ul>

      <h3>International Shipping Charges</h3>
      <ul>
        <li>Shipping charges are calculated based on destination and package weight</li>
        <li>Charges will be displayed at checkout</li>
        <li>Import duties and taxes are the responsibility of the customer</li>
        <li>We are not responsible for customs delays</li>
      </ul>

      <h2>Shipping Partners</h2>
      <p>We work with reputed courier partners to ensure safe delivery:</p>
      <ul>
        <li>Delhivery</li>
        <li>Blue Dart</li>
        <li>DTDC</li>
        <li>India Post (for remote areas)</li>
        <li>DHL/FedEx (for international orders)</li>
      </ul>

      <h2>Order Tracking</h2>
      <p>Track your order easily:</p>
      <ul>
        <li>Use the tracking link sent via email/SMS</li>
        <li>Log in to your account and visit "My Orders"</li>
        <li>Contact our support team with your order number</li>
      </ul>

      <h2>Packaging</h2>
      <p>We take utmost care in packaging your sarees:</p>
      <ul>
        <li>Each saree is carefully folded and wrapped in protective packaging</li>
        <li>Products are packed in eco-friendly boxes with tissue paper</li>
        <li>Fragile items are marked and handled with extra care</li>
        <li>Gift wrapping available on request (additional charges apply)</li>
      </ul>

      <h2>Delivery Instructions</h2>
      <ul>
        <li>Please ensure someone is available to receive the package</li>
        <li>Delivery will be attempted 2-3 times if undelivered</li>
        <li>Packages will be returned to us after failed delivery attempts</li>
        <li>Re-shipping charges may apply for returned packages</li>
      </ul>

      <h2>Delayed or Lost Shipments</h2>
      <p>In case of delayed or lost shipments:</p>
      <ul>
        <li>Contact us if your order hasn't arrived within the estimated time</li>
        <li>We will coordinate with the courier partner to locate your package</li>
        <li>For lost shipments, we will either reship the order or process a full refund</li>
        <li>Claims for lost packages must be made within 15 days of estimated delivery date</li>
      </ul>

      <h2>Damaged During Transit</h2>
      <p>If your package arrives damaged:</p>
      <ul>
        <li>Inspect the package before accepting from the courier</li>
        <li>If visibly damaged, refuse delivery and contact us immediately</li>
        <li>If damage is discovered after opening, take photos and report within 48 hours</li>
        <li>We will arrange replacement or refund at no additional cost</li>
      </ul>

      <h2>Cash on Delivery (COD)</h2>
      <ul>
        <li>COD available for orders up to ₹10,000</li>
        <li>COD charges: ₹40 per order</li>
        <li>Not available for international orders</li>
        <li>Please keep exact change ready at the time of delivery</li>
      </ul>

      <h2>Contact Us</h2>
      <p>For shipping-related queries, please contact us:</p>
      <ul>
        <li><strong>Email:</strong> info@jjtrendz.com</li>
        <li><strong>Phone:</strong> +91 88072 59471</li>
        <li><strong>WhatsApp:</strong> +91 88072 59471</li>
        <li><strong>Working Hours:</strong> Monday to Saturday, 10:00 AM - 7:00 PM IST</li>
      </ul>
    </PolicyLayout>
  );
};

export default ShippingPolicy;

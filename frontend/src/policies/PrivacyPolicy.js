import React from "react";
import PolicyLayout from "./PolicyLayout";
import { FaShieldAlt } from "react-icons/fa";

const PrivacyPolicy = () => {
  return (
    <PolicyLayout title="Privacy Policy" icon={FaShieldAlt}>
      <p>
        At <strong>JJ Trendz Official</strong>, we are committed to protecting your privacy and ensuring
        the security of your personal information. This Privacy Policy explains how we collect, use,
        disclose, and safeguard your information when you visit our website or make a purchase.
      </p>

      <h2>Information We Collect</h2>
      <p>We collect information that you provide directly to us, including:</p>
      <ul>
        <li><strong>Personal Information:</strong> Name, email address, phone number, and date of birth</li>
        <li><strong>Billing Information:</strong> Billing address and payment details</li>
        <li><strong>Shipping Information:</strong> Delivery address and contact number</li>
        <li><strong>Account Information:</strong> Username, password, and purchase history</li>
        <li><strong>Communication Data:</strong> Messages, reviews, and feedback you send us</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect for various purposes, including:</p>
      <ul>
        <li>Processing and fulfilling your orders</li>
        <li>Sending order confirmations and shipping updates</li>
        <li>Providing customer support and responding to inquiries</li>
        <li>Personalizing your shopping experience</li>
        <li>Sending promotional offers and newsletters (with your consent)</li>
        <li>Improving our website, products, and services</li>
        <li>Preventing fraud and ensuring security</li>
      </ul>

      <h2>Information Sharing</h2>
      <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
      <ul>
        <li><strong>Service Providers:</strong> With trusted third-party companies that assist us in operating our website, conducting our business, or servicing you (e.g., payment processors, shipping partners)</li>
        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights, privacy, safety, or property</li>
        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We implement appropriate technical and organizational security measures to protect your personal
        information against unauthorized access, alteration, disclosure, or destruction. These measures include:
      </p>
      <ul>
        <li>SSL encryption for all data transmission</li>
        <li>Secure payment processing through trusted gateways</li>
        <li>Regular security assessments and updates</li>
        <li>Limited access to personal information by authorized personnel only</li>
      </ul>

      <h2>Cookies and Tracking</h2>
      <p>
        We use cookies and similar tracking technologies to enhance your browsing experience, analyze
        website traffic, and understand where our visitors are coming from. You can control cookie
        settings through your browser preferences.
      </p>

      <h2>Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access and receive a copy of your personal data</li>
        <li>Correct any inaccurate or incomplete information</li>
        <li>Request deletion of your personal data</li>
        <li>Opt-out of marketing communications</li>
        <li>Withdraw consent at any time</li>
      </ul>

      <h2>Children's Privacy</h2>
      <p>
        Our website is not intended for children under 13 years of age. We do not knowingly collect
        personal information from children under 13. If you believe we have collected information
        from a child under 13, please contact us immediately.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage
        you to review this Privacy Policy periodically.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy or our data practices, please contact us at:
      </p>
      <ul>
        <li><strong>Email:</strong> info@jjtrendz.com</li>
        <li><strong>Phone:</strong> +91 88072 59471</li>
        <li><strong>Address:</strong> 11/109/2, Edavattam, Thirunanthikarai, Kulasekharam, Kanyakumari Dist - 629161, Tamilnadu, India</li>
      </ul>
    </PolicyLayout>
  );
};

export default PrivacyPolicy;

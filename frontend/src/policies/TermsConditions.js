import React from "react";
import PolicyLayout from "./PolicyLayout";
import { FaFileContract } from "react-icons/fa";

const TermsConditions = () => {
  return (
    <PolicyLayout title="Terms & Conditions" icon={FaFileContract}>
      <p>
        Welcome to <strong>JJ Trendz Official</strong>. By accessing and using our website, you agree to
        be bound by these Terms and Conditions. Please read them carefully before making any purchase
        or using our services.
      </p>

      <h2>Acceptance of Terms</h2>
      <p>
        By accessing this website, you acknowledge that you have read, understood, and agree to be
        bound by these Terms and Conditions. If you do not agree with any part of these terms, you
        must not use our website.
      </p>

      <h2>Use of Website</h2>
      <p>You agree to use this website only for lawful purposes. You must not:</p>
      <ul>
        <li>Use the website in any way that violates applicable laws or regulations</li>
        <li>Attempt to gain unauthorized access to our systems or user accounts</li>
        <li>Transmit any viruses, malware, or harmful code</li>
        <li>Engage in any activity that disrupts or interferes with the website</li>
        <li>Copy, reproduce, or redistribute content without permission</li>
        <li>Use automated tools to scrape or collect data from the website</li>
      </ul>

      <h2>Account Registration</h2>
      <p>When creating an account, you agree to:</p>
      <ul>
        <li>Provide accurate and complete information</li>
        <li>Maintain the security of your account credentials</li>
        <li>Notify us immediately of any unauthorized access</li>
        <li>Accept responsibility for all activities under your account</li>
      </ul>

      <h2>Products and Pricing</h2>
      <p>
        We make every effort to display accurate product descriptions, images, and prices. However:
      </p>
      <ul>
        <li>Colors may vary slightly due to photography and screen settings</li>
        <li>Minor variations in handcrafted items are natural and add to their uniqueness</li>
        <li>Prices are subject to change without prior notice</li>
        <li>We reserve the right to correct any pricing errors</li>
        <li>All prices are displayed in Indian Rupees (INR) and include applicable taxes</li>
      </ul>

      <h2>Orders and Payment</h2>
      <p>By placing an order, you agree that:</p>
      <ul>
        <li>All information provided is accurate and complete</li>
        <li>You are authorized to use the payment method provided</li>
        <li>We reserve the right to refuse or cancel any order</li>
        <li>Order confirmation does not guarantee product availability</li>
        <li>Payment must be received in full before order processing</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        All content on this website, including but not limited to text, graphics, logos, images,
        product designs, and software, is the property of JJ Trendz Official and is protected by
        intellectual property laws. You may not:
      </p>
      <ul>
        <li>Reproduce, distribute, or modify any content without written permission</li>
        <li>Use our trademarks or logos without authorization</li>
        <li>Create derivative works based on our content</li>
        <li>Remove any copyright or proprietary notices</li>
      </ul>

      <h2>User Content</h2>
      <p>
        By submitting reviews, comments, or other content, you grant us a non-exclusive, royalty-free,
        perpetual license to use, reproduce, and display such content. You represent that:
      </p>
      <ul>
        <li>You own or have the right to submit the content</li>
        <li>The content does not violate any third-party rights</li>
        <li>The content is not false, misleading, or defamatory</li>
      </ul>

      <h2>Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, JJ Trendz Official shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages arising from your use of the website
        or purchase of products. Our total liability shall not exceed the amount paid by you for the
        specific product or service giving rise to the claim.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless JJ Trendz Official, its officers, directors, employees,
        and agents from any claims, damages, losses, or expenses arising from your violation of these
        Terms and Conditions or your use of the website.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms and Conditions shall be governed by and construed in accordance with the laws of
        India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction
        of the courts in Kanyakumari District, Tamil Nadu.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to modify these Terms and Conditions at any time. Changes will be
        effective immediately upon posting on the website. Your continued use of the website after
        any changes constitutes acceptance of the new terms.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about these Terms and Conditions, please contact us at:
      </p>
      <ul>
        <li><strong>Email:</strong> info@jjtrendz.com</li>
        <li><strong>Phone:</strong> +91 88072 59471</li>
        <li><strong>Address:</strong> 11/109/2, Edavattam, Thirunanthikarai, Kulasekharam, Kanyakumari Dist - 629161, Tamilnadu, India</li>
      </ul>
    </PolicyLayout>
  );
};

export default TermsConditions;

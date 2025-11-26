import React from 'react';
import '../App.css';

export default function TermsOfUse() {
  return (
    <div className="page-container" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Terms of Use</h1>
      <p>Last updated: November 26, 2025</p>

      <section style={{ marginBottom: '20px' }}>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using QuizMaster ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
        </p>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>2. Description of Service</h2>
        <p>
          QuizMaster provides an online platform for educators to create quizzes and for students to take them. The Service allows for the creation, distribution, and grading of educational assessments.
        </p>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>3. User Accounts</h2>
        <p>
          To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
        </p>
        <p>
          You are responsible for safeguarding your password. You agree that you will not disclose your password to any third party and that you will take sole responsibility for any activities or actions under your account, whether or not you have authorized such activities or actions.
        </p>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>4. User Content</h2>
        <p>
          You retain all rights to any content you submit, post or display on or through the Service. By submitting, posting or displaying content on or through the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content in any and all media or distribution methods.
        </p>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>5. Prohibited Uses</h2>
        <p>
          You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, impairs, or renders the Service less efficient. You agree not to attempt to gain unauthorized access to the Service or to the servers and network associated with the Service.
        </p>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>6. Termination</h2>
        <p>
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>7. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.
        </p>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at support@quizmaster.com.
        </p>
      </section>
    </div>
  );
}

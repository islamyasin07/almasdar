// Email service for sending notifications
// In production, integrate with SendGrid, AWS SES, or similar service

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  // Send order confirmation email
  static async sendOrderConfirmation(
    email: string,
    orderNumber: string,
    total: number
  ): Promise<void> {
    const subject = `Order Confirmation - #${orderNumber}`;
    const html = `
      <h1>Thank you for your order!</h1>
      <p>Your order #${orderNumber} has been confirmed.</p>
      <p>Total: $${total.toFixed(2)}</p>
      <p>You will receive a shipping confirmation once your order is on its way.</p>
    `;

    await this.send({ to: email, subject, html });
  }

  // Send shipping notification
  static async sendShippingNotification(
    email: string,
    orderNumber: string,
    trackingNumber: string
  ): Promise<void> {
    const subject = `Your order has shipped - #${orderNumber}`;
    const html = `
      <h1>Your order is on the way!</h1>
      <p>Your order #${orderNumber} has been shipped.</p>
      <p>Tracking number: ${trackingNumber}</p>
    `;

    await this.send({ to: email, subject, html });
  }

  // Send password reset email
  static async sendPasswordReset(
    email: string,
    resetToken: string,
    resetUrl: string
  ): Promise<void> {
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}?token=${resetToken}">Reset Password</a>
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.send({ to: email, subject, html });
  }

  // Send welcome email
  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Welcome to Almasdar Security';
    const html = `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining Almasdar Security.</p>
      <p>Start shopping for the best security systems and equipment.</p>
    `;

    await this.send({ to: email, subject, html });
  }

  // Low stock alert (for admin)
  static async sendLowStockAlert(
    adminEmail: string,
    productName: string,
    stock: number
  ): Promise<void> {
    const subject = `Low Stock Alert - ${productName}`;
    const html = `
      <h1>Low Stock Alert</h1>
      <p>Product: ${productName}</p>
      <p>Current stock: ${stock}</p>
      <p>Please reorder soon.</p>
    `;

    await this.send({ to: adminEmail, subject, html });
  }

  // Generic send method
  private static async send(options: EmailOptions): Promise<void> {
    // In development, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.html}`);
      return;
    }

    // In production, integrate with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: options.to,
    //   from: 'noreply@almasdar.com',
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text
    // });

    console.log(`Email sent to ${options.to}: ${options.subject}`);
  }
}

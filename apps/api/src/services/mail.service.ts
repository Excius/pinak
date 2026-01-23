import nodemailer from "nodemailer";
import type { SendMailOptions, Transporter } from "nodemailer";
import appConfig from "../lib/config.js";
import loggerInstance from "../lib/logger.js";
import { VerificationEmailInput } from "../types/mail.types.js";
import { verificationTemplate } from "../templates/mail.templates.js";

class Mailer {
  private static transporter: Transporter;

  static get(): Transporter {
    if (!Mailer.transporter) {
      Mailer.transporter = nodemailer.createTransport({
        host: appConfig.SMTP_HOST,
        port: appConfig.SMTP_PORT,
        secure: appConfig.SMTP_SECURE,
        auth: appConfig.SMTP_USER
          ? { user: appConfig.SMTP_USER, pass: appConfig.SMTP_PASS }
          : undefined,
      });
    }

    return Mailer.transporter;
  }
}

const mailer = Mailer.get();

export class MailService {
  private static from = appConfig.MAIL_FROM;

  private static async send(options: SendMailOptions) {
    try {
      await mailer.sendMail(options);
      loggerInstance.info(
        `Email sent to: ${options.to} with subject: ${options.subject}`,
      );
    } catch (error) {
      loggerInstance.error(`Failed to send email to: ${options.to}`, error);
    }
  }

  static async sendVerificationEmail(
    data: VerificationEmailInput,
  ): Promise<void> {
    const template = verificationTemplate(data.name, data.verificationLink);

    return this.send({
      from: this.from,
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  static async sendPasswordResetEmail(
    to: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    const template = {
      subject: "Reset your password",
      html: `
        <p>Hi ${name},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
      `,
      text: `Reset your password: ${resetLink}`,
    };

    return this.send({
      from: this.from,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  static async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const template = {
      subject: "Welcome 🎉",
      html: `<p>Welcome ${name}! Glad to have you.</p>`,
      text: `Welcome ${name}!`,
    };

    return this.send({
      from: this.from,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}

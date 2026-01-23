export function verificationTemplate(name: string, link: string) {
  return {
    subject: "Verify your email",
    html: `
      <p>Hi ${name},</p>
      <p>Please verify your email by clicking below:</p>
      <a href="${link}">Verify Email</a>
    `,
    text: `Hi ${name}, verify your email: ${link}`,
  };
}

export function passwordResetTemplate(name: string, link: string) {
  return {
    subject: "Reset your password",
    html: `
      <p>Hi ${name},</p>
      <p>Click below to reset your password:</p>
      <a href="${link}">Reset Password</a>
    `,
    text: `Reset your password: ${link}`,
  };
}

export function welcomeTemplate(name: string) {
  return {
    subject: "Welcome 🎉",
    html: `<p>Welcome ${name}! Glad to have you.</p>`,
    text: `Welcome ${name}!`,
  };
}

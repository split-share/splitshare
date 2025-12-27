import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { logger } from './logger';

function getResend() {
	if (!env.RESEND_API_KEY) {
		throw new Error('RESEND_API_KEY environment variable is not set');
	}
	return new Resend(env.RESEND_API_KEY);
}

function getEmailFrom() {
	if (!env.EMAIL_FROM) {
		throw new Error('EMAIL_FROM environment variable is not set');
	}
	return env.EMAIL_FROM;
}

function getAppUrl() {
	return publicEnv.PUBLIC_APP_URL || 'http://localhost:5173';
}

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
	try {
		const resend = getResend();
		const { data, error } = await resend.emails.send({
			from: getEmailFrom(),
			to,
			subject,
			html
		});

		if (error) {
			throw new Error(`Failed to send email: ${error.message}`);
		}

		logger.info('Email sent successfully', { to, subject });
		return data;
	} catch (error) {
		logger.error('Email sending failed', {
			to,
			subject,
			errorMessage: error instanceof Error ? error.message : String(error),
			errorStack: error instanceof Error ? error.stack : undefined
		});
		throw error;
	}
}

export async function sendVerificationEmail(email: string, verificationUrl: string) {
	return sendEmail({
		to: email,
		subject: 'Verify your SplitShare account',
		html: `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SplitShare!</h1>
					</div>
					<div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
						<p style="font-size: 16px; margin-bottom: 20px;">Thanks for signing up! Please verify your email address to get started.</p>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${verificationUrl}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
						</div>
						<p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If you didn't create an account, you can safely ignore this email.</p>
						<p style="font-size: 14px; color: #6b7280;">Or copy and paste this URL into your browser:</p>
						<p style="font-size: 12px; color: #9ca3af; word-break: break-all;">${verificationUrl}</p>
					</div>
				</body>
			</html>
		`
	});
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
	return sendEmail({
		to: email,
		subject: 'Reset your SplitShare password',
		html: `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
					</div>
					<div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
						<p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password:</p>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${resetUrl}" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
						</div>
						<p style="font-size: 14px; color: #6b7280; margin-top: 30px;">This link will expire in 1 hour.</p>
						<p style="font-size: 14px; color: #6b7280;">If you didn't request a password reset, you can safely ignore this email.</p>
						<p style="font-size: 14px; color: #6b7280;">Or copy and paste this URL into your browser:</p>
						<p style="font-size: 12px; color: #9ca3af; word-break: break-all;">${resetUrl}</p>
					</div>
				</body>
			</html>
		`
	});
}

export async function sendWelcomeEmail(email: string, name: string) {
	return sendEmail({
		to: email,
		subject: 'Welcome to SplitShare!',
		html: `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
						<h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SplitShare!</h1>
					</div>
					<div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
						<p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
						<p style="font-size: 16px; margin-bottom: 20px;">Welcome to SplitShare - your community for sharing and discovering workout routines!</p>
						<p style="font-size: 16px; margin-bottom: 20px;">Here's what you can do:</p>
						<ul style="font-size: 16px; margin-bottom: 20px;">
							<li>Create custom workout splits</li>
							<li>Share your routines with the community</li>
							<li>Discover popular workout programs</li>
							<li>Track your workout progress</li>
							<li>Follow other fitness enthusiasts</li>
						</ul>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${getAppUrl()}/splits" style="background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Get Started</a>
						</div>
						<p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If you have any questions, feel free to reach out!</p>
					</div>
				</body>
			</html>
		`
	});
}

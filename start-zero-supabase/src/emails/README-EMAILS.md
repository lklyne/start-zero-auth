# Email System

This directory contains the email templates and components used by the application for sending transactional emails via Resend.

## Setup

1. Sign up for a [Resend](https://resend.com) account
2. Create an API key in the Resend dashboard
3. Add the following environment variables to your `.env` file:

```env
RESEND_API_KEY="re_123456789" # Get from https://resend.com/api-keys
EMAIL_FROM="Your App <hello@example.com>"
```

## Directory Structure

- `components/` - Reusable email components
  - `layout.tsx` - Base layout for all emails
- `templates/` - Email templates
  - `welcome.tsx` - Welcome email template
  - `notification.tsx` - Notification email template

## Usage

### Sending Emails from the Server

```typescript
import { sendEmail } from '@/server/email/send'
import WelcomeEmail from '@/emails/templates/welcome'
import React from 'react'

// Send a welcome email
const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to our platform!',
  react: React.createElement(WelcomeEmail, {
    username: 'John',
    verifyUrl: 'https://example.com/verify?token=abc123',
  }),
})
```

### Sending Emails from the Client

```typescript
import { sendEmail } from '@/lib/email-client'

// Send a welcome email
const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to our platform!',
  templateName: 'welcome',
  data: {
    username: 'John',
    verifyUrl: 'https://example.com/verify?token=abc123',
  },
})

// Send a notification email
const result = await sendEmail({
  to: 'user@example.com',
  subject: 'You have a new notification',
  templateName: 'notification',
  data: {
    username: 'John',
    message: 'This is a notification message',
    actionUrl: 'https://example.com/action',
    actionText: 'View Details',
  },
})
```

## Creating New Templates

1. Create a new `.tsx` file in the `templates/` directory
2. Define the template props interface
3. Create the component using the shared layout
4. Update the `EmailTemplateData` type in `src/lib/email-client.ts`

Example:

```tsx
// src/emails/templates/password-reset.tsx
import Layout from '../components/layout'
import { Button, Heading, Text } from '@react-email/components'

interface PasswordResetEmailProps {
  username: string
  resetUrl: string
}

export default function PasswordResetEmail({
  username,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Layout preview="Reset your password">
      <Heading>Hi {username},</Heading>
      <Text>We received a request to reset your password.</Text>
      <Button href={resetUrl}>Reset Password</Button>
      <Text>If you didn't request this, you can safely ignore this email.</Text>
    </Layout>
  )
}
```

Then update the `EmailTemplateData` type:

```typescript
// src/lib/email-client.ts
export type EmailTemplateData = {
  welcome: WelcomeEmailData
  notification: NotificationEmailData
  passwordReset: PasswordResetEmailData // Add the new template
}

export interface PasswordResetEmailData {
  username: string
  resetUrl: string
}
```

## Testing

You can test email sending using the preview page at `/app/email-preview`.

## Documentation

- [Resend API Documentation](https://resend.com/docs/api-reference/emails/send-email)
- [React Email Documentation](https://react.email/docs/introduction)

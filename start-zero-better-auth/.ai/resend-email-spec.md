# Resend + React Email Implementation Spec

## Overview

This document outlines the implementation plan for adding email functionality to our TanStack Start application using Resend for email delivery and React Email for templating.

## Tech Stack Components

- TanStack Start (Bun preset)
- Resend for email delivery
- React Email for templating
- Environment: Bun runtime
- Deployment target: Fly.io / AWS via SST

## Implementation Steps

### 1. Initial Setup

#### 1.1 Dependencies

```bash
# Install required packages
bun add resend @react-email/components @react-email/render
```

#### 1.2 Environment Configuration

Create/update `.env`:

```env
RESEND_API_KEY=re_123...  # Your Resend API key
EMAIL_FROM=you@yourdomain.com
```

### 2. Project Structure

```
src/
├── emails/                    # Email templates
│   ├── components/           # Shared email components
│   │   └── layout.tsx       # Base email layout
│   └── templates/           # Email template components
│       ├── welcome.tsx
│       └── notification.tsx
├── server/
│   └── email/
│       ├── client.ts        # Resend client setup
│       └── send.ts          # Email sending functions
└── routes/
    └── api/
        └── email/
            └── send.ts      # Email API endpoint
```

### 3. Implementation Details

#### 3.1 Resend Client Setup (src/server/email/client.ts)

```typescript
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable')
}

export const resend = new Resend(process.env.RESEND_API_KEY)
```

#### 3.2 Base Email Layout (src/emails/components/layout.tsx)

```typescript
import { Container, Html, Head, Body } from '@react-email/components';

export interface LayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export default function Layout({ children, preview }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>{children}</Container>
      </Body>
    </Html>
  );
}
```

#### 3.3 Email Sending Function (src/server/email/send.ts)

```typescript
import { render } from '@react-email/render'
import { resend } from './client'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const html = render(react)

  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  })
}
```

#### 3.4 API Route (src/routes/api/email/send.ts)

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { sendEmail } from '@/server/email/send';

export const Route = createFileRoute('/api/email/send')({
  validateBody: (body: unknown) => {
    // Add Zod validation here
    return body as { to: string; subject: string; templateName: string; data: any };
  },
  handler: async ({ body }) => {
    const { to, subject, templateName, data } = body;

    // Dynamic import of template
    const Template = (await import(`@/emails/templates/${templateName}`)).default;

    const result = await sendEmail({
      to,
      subject,
      react: <Template {...data} />,
    });

    return { success: true, result };
  },
});
```

### 4. Usage Example

#### 4.1 Email Template (src/emails/templates/welcome.tsx)

```typescript
import Layout from '../components/layout';
import { Heading, Text, Button } from '@react-email/components';

interface WelcomeEmailProps {
  username: string;
  verifyUrl: string;
}

export default function WelcomeEmail({ username, verifyUrl }: WelcomeEmailProps) {
  return (
    <Layout preview="Welcome to our platform!">
      <Heading>Welcome, {username}!</Heading>
      <Text>We're excited to have you on board.</Text>
      <Button href={verifyUrl}>Verify Email</Button>
    </Layout>
  );
}
```

#### 4.2 Client-side Usage

```typescript
async function sendWelcomeEmail(email: string, username: string) {
  const response = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: 'Welcome to Our Platform',
      templateName: 'welcome',
      data: {
        username,
        verifyUrl: `https://app.example.com/verify?token=...`,
      },
    }),
  })

  return response.json()
}
```

### 5. Deployment Configuration

#### 5.1 Fly.io Configuration (fly.toml)

```toml
app = "your-app-name"
primary_region = "dfw"

[env]
  PORT = "3000"

[build]
  builder = "dockerfile"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]
```

#### 5.2 Dockerfile

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "run", ".output/server/index.mjs"]
```

### 6. Testing

#### 6.1 Email Preview Testing

Create a development route for previewing emails:

```typescript
// src/routes/_dev/email-preview.tsx
export const Route = createFileRoute('/_dev/email-preview')({
  component: EmailPreview,
});

function EmailPreview() {
  // Add preview rendering logic here
  return <div>...</div>;
}
```

#### 6.2 Integration Testing

Add test files for email sending functionality:

```typescript
// src/server/email/__tests__/send.test.ts
import { describe, it, expect } from 'bun:test'
import { sendEmail } from '../send'

describe('sendEmail', () => {
  it('should send an email successfully', async () => {
    // Add test implementation
  })
})
```

## Security Considerations

1. **Environment Variables**

   - Never commit API keys
   - Use Fly.io secrets for production
   - Use `.env.example` for documentation

2. **Input Validation**

   - Validate all email addresses
   - Sanitize template data
   - Rate limit email sending

3. **Error Handling**
   - Log email sending failures
   - Implement retry logic for transient failures
   - Provide meaningful error messages

## Monitoring and Maintenance

1. **Logging**

   - Log all email attempts
   - Track delivery success/failure
   - Monitor template rendering errors

2. **Analytics**

   - Track email open rates (via Resend)
   - Monitor bounce rates
   - Track click-through rates

3. **Maintenance**
   - Regular template updates
   - API key rotation
   - Dependency updates

## Future Enhancements

1. **Template Management**

   - Admin interface for template editing
   - Template versioning
   - A/B testing support

2. **Queue System**

   - Implement email queue for bulk sending
   - Retry mechanism for failed emails
   - Rate limiting per user/global

3. **Advanced Features**
   - Attachment support
   - HTML/Plain text alternatives
   - Internationalization support

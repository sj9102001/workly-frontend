This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Workly - Authentication Guide

## Authentication Architecture

Workly uses a custom authentication system with HTTP-only JWT cookies and a React Context for managing user state. The authentication flow is handled by the following components:

### 1. User Context (`app/contexts/UserContext.tsx`)

The UserContext provides global access to:
- Current user data
- Login/logout functionality
- Loading state

```typescript
interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

// Access user data and functions in any component:
const { user, setUser, logout, loading } = useUser();
```

### 2. Protected Routes

Protected routes are handled by the middleware (`middleware.ts`). It checks for the presence of the JWT cookie and redirects unauthorized users to the login page.

### 3. Authentication Flow

#### Login
```typescript
// Example login call
const res = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    credentials: 'include', // Important for cookies
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        email,
        password,
    }),
});
```

#### Logout
```typescript
// Use the logout function from UserContext
const { logout } = useUser();
await logout();
```

## Using Authentication in Components

### 1. Accessing User Data

```typescript
import { useUser } from '../contexts/UserContext';

function MyComponent() {
    const { user, loading } = useUser();

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Not authenticated</div>;

    return <div>Welcome, {user.name}!</div>;
}
```

### 2. Protected API Calls

When making API calls to protected endpoints, always include the `credentials: 'include'` option:

```typescript
const fetchData = async () => {
    const res = await fetch('http://localhost:8080/api/protected-endpoint', {
        credentials: 'include'
    });
    // ... handle response
};
```

### 3. Handling Authentication State

The UserContext automatically:
- Checks for an existing session on app load
- Provides current user data
- Handles logout
- Manages loading states

## Security Features

1. HTTP-only JWT cookies for secure token storage
2. Automatic redirection of unauthenticated users
3. Protected route middleware
4. Secure session management

## Best Practices

1. Always use the `useUser` hook to access user data
2. Include `credentials: 'include'` in all API calls
3. Handle loading states appropriately
4. Use the provided logout function instead of clearing cookies manually

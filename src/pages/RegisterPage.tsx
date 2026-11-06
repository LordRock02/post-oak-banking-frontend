import { useState } from "react"
import type { FormEvent } from "react"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { FormAlert } from "@/components/auth/shared"
import { SubmitButton } from "@/components/dashboard/actions/shared"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthActions } from "@/hooks/useAuth"
import { registerErrorMessage } from "@/lib/authErrors"
import { notify } from "@/lib/toast"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

interface RegisterPageProps {
  onSwitchToLogin: () => void
  onRegistered: () => void
}

export function RegisterPage({ onSwitchToLogin, onRegistered }: RegisterPageProps) {
  const { register } = useAuthActions()

  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const errors = {
    fullName: !fullName.trim() ? "Full name is required." : undefined,
    companyName: !companyName.trim() ? "Company name is required." : undefined,
    email: !email.trim()
      ? "Email is required."
      : !EMAIL_PATTERN.test(email)
        ? "Enter a valid email address."
        : undefined,
    password: !password
      ? "Password is required."
      : password.length < MIN_PASSWORD_LENGTH
        ? `Must be at least ${MIN_PASSWORD_LENGTH} characters.`
        : undefined,
  }
  const hasErrors = Object.values(errors).some(Boolean)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    setFormError(null)
    if (hasErrors) return

    setSubmitting(true)
    try {
      await register({
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        password,
      })
      notify("Account created", "You can now sign in.")
      onRegistered()
    } catch (err) {
      setFormError(registerErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Set up Post Oak Banking for your business."
      footer={
        <>
          Already have an account?{" "}
          <Button variant="link" type="button" className="h-auto p-0 text-sm" onClick={onSwitchToLogin}>
            Sign in
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError && <FormAlert message={formError} />}

        <Field label="Full name" htmlFor="register-name" error={touched ? errors.fullName : undefined}>
          <Input
            id="register-name"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={touched && !!errors.fullName}
            className="h-10"
          />
        </Field>

        <Field
          label="Company name"
          htmlFor="register-company"
          error={touched ? errors.companyName : undefined}
        >
          <Input
            id="register-company"
            autoComplete="organization"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            aria-invalid={touched && !!errors.companyName}
            className="h-10"
          />
        </Field>

        <Field label="Email" htmlFor="register-email" error={touched ? errors.email : undefined}>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={touched && !!errors.email}
            className="h-10"
          />
        </Field>

        <Field
          label="Password"
          htmlFor="register-password"
          error={touched ? errors.password : undefined}
          hint={!touched || !errors.password ? `At least ${MIN_PASSWORD_LENGTH} characters.` : undefined}
        >
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={touched && !!errors.password}
            className="h-10"
          />
        </Field>

        <SubmitButton submitting={submitting}>Create account</SubmitButton>
      </form>
    </AuthLayout>
  )
}

import { Body, Container, Head, Heading, Html, Preview, Text, Button } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface VerificationEmailProps {
  recipientEmail: string
  verificationUrl: string
}

export const VerificationEmail = ({ recipientEmail, verificationUrl }: VerificationEmailProps) => {
  const previewText = "Verify your email for DecisionPoint"

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              <strong>Verify your email</strong>
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">Hello {recipientEmail},</Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Thanks for your interest in DecisionPoint! To complete your waitlist registration, please verify your
              email address.
            </Text>

            <div className="text-center my-[32px]">
              <Button
                href={verificationUrl}
                className="bg-black rounded text-white font-bold no-underline text-center py-[12px] px-[20px]"
              >
                Verify Email Address
              </Button>
            </div>

            <Text className="text-black text-[14px] leading-[24px]">Or copy and paste this URL into your browser:</Text>

            <Text className="text-blue-600 text-[12px] leading-[24px] break-all">{verificationUrl}</Text>

            <Text className="text-black text-[14px] leading-[24px]">
              If you didn't sign up for DecisionPoint, you can safely ignore this email.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Best regards,
              <br />
              The DecisionPoint Team
            </Text>

            <Text className="text-gray-400 text-[12px] leading-[24px] mt-10">
              DecisionPoint - Simplifying M&A for business brokers and advisors.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default VerificationEmail

import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface WelcomeEmailProps {
  recipientEmail: string
}

export const WelcomeEmail = ({ recipientEmail }: WelcomeEmailProps) => {
  const previewText = "Welcome to the DecisionPoint waitlist"

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              <strong>Welcome to DecisionPoint</strong>
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">Hello!</Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Thanks for joining the DecisionPoint waitlist! We're building a platform to help business brokers simplify
              seller onboarding, organize documents, and get to closing day with less chaos.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              We'll keep you updated on our progress and let you know when early access becomes available.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              In the meantime, if you have any questions or feedback, feel free to reply to this email.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Connect with us on:
              <br />•{" "}
              <a
                href="https://www.linkedin.com/company/decisionpoint-os/about/?viewAsMember=true"
                style={{ color: "#0077b5", textDecoration: "underline" }}
              >
                LinkedIn
              </a>
              <br />•{" "}
              <a
                href="https://www.instagram.com/decisionpnt/"
                style={{ color: "#e1306c", textDecoration: "underline" }}
              >
                Instagram
              </a>
              <br />•{" "}
              <a
                href="https://www.facebook.com/people/DecisionPoint/61576385578079/?sk=about"
                style={{ color: "#3b5998", textDecoration: "underline" }}
              >
                Facebook
              </a>
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

export default WelcomeEmail

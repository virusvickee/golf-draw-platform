import { HeroSection } from "../components/home/HeroSection"
import { HowItWorks } from "../components/home/HowItWorks"
import { PrizePool } from "../components/home/PrizePool"
import { CharitySpotlight } from "../components/home/CharitySpotlight"
import { SubscribeCTA } from "../components/home/SubscribeCTA"

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <HowItWorks />
      <PrizePool />
      <CharitySpotlight />
      <SubscribeCTA />
    </div>
  )
}

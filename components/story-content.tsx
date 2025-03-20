import Image from "next/image"

export default function StoryContent() {
  // This would typically fetch the story content from an API
  // For this example, we'll use static content

  return (
    <div className="p-6 md:p-10">
      {/* Story illustration */}
      <div className="relative h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
        <Image
          src="/placeholder.svg?height=400&width=800"
          alt="Emma in a spaceship flying through colorful stars"
          fill
          className="object-cover"
        />
      </div>

      {/* Story text */}
      <div className="prose prose-lg max-w-none">
        <p className="text-xl leading-relaxed mb-6">
          Once upon a time, there was a brave girl named Emma who dreamed of exploring the stars. Every night, she would
          look up at the twinkling sky from her bedroom window and imagine what adventures awaited her in the vast
          universe.
        </p>

        <p className="text-xl leading-relaxed mb-6">
          One magical evening, as Emma was stargazing, she noticed something unusual—a small, glowing spaceship hovering
          just outside her window! The door of the spaceship opened, and out popped a friendly robot named Blip.
        </p>

        <p className="text-xl leading-relaxed mb-6">
          "Hello, Emma!" beeped Blip. "I've been watching you watch the stars, and I think you'd make an excellent space
          explorer. Would you like to join me on an adventure?"
        </p>

        <div className="relative h-48 md:h-64 my-8 rounded-xl overflow-hidden">
          <Image
            src="/placeholder.svg?height=300&width=600"
            alt="Emma meeting Blip the robot"
            fill
            className="object-cover"
          />
        </div>

        <p className="text-xl leading-relaxed mb-6">
          Emma couldn't believe her ears! Without hesitation, she grabbed her favorite stuffed animal, a purple teddy
          bear named Cosmo, and climbed aboard the spaceship. With a whoosh and a zoom, they were off, soaring through
          the night sky and into the stars.
        </p>

        <p className="text-xl leading-relaxed mb-6">
          Their first stop was the Rainbow Planet, where waterfalls of colorful light cascaded from floating mountains.
          The inhabitants of Rainbow Planet were friendly creatures made of light who danced and twirled around Emma and
          Blip.
        </p>

        <p className="text-xl leading-relaxed mb-6">
          "Would you like to join our Rainbow Dance?" they asked. Emma and Blip spent hours dancing with their new
          friends, creating beautiful patterns of light that spiraled up into the sky.
        </p>

        <div className="relative h-48 md:h-64 my-8 rounded-xl overflow-hidden">
          <Image
            src="/placeholder.svg?height=300&width=600"
            alt="Emma and Blip dancing with light creatures on Rainbow Planet"
            fill
            className="object-cover"
          />
        </div>

        <p className="text-xl leading-relaxed mb-6">
          Next, they visited the Bubble Moon, where everything was made of bouncy, transparent bubbles. Emma and Blip
          bounced from bubble to bubble, floating gently through the air and giggling with delight.
        </p>

        <p className="text-xl leading-relaxed mb-6">
          Their final adventure took them to the Star Bakery, where tiny star chefs were busy making new stars to place
          in the night sky. They let Emma design her very own star—a beautiful purple and blue swirling star that
          twinkled extra bright.
        </p>

        <p className="text-xl leading-relaxed mb-6">
          "We'll place your star right above your house," promised the Star Baker. "So whenever you look up at the night
          sky, you'll remember your space adventure."
        </p>

        <div className="relative h-48 md:h-64 my-8 rounded-xl overflow-hidden">
          <Image
            src="/placeholder.svg?height=300&width=600"
            alt="Emma creating her own star at the Star Bakery"
            fill
            className="object-cover"
          />
        </div>

        <p className="text-xl leading-relaxed mb-6">
          As the night grew late, Blip knew it was time to take Emma home. They said goodbye to all their new friends
          and promised to visit again soon. The spaceship zoomed back through the stars, and before Emma knew it, they
          were hovering outside her bedroom window once more.
        </p>

        <p className="text-xl leading-relaxed mb-6">
          "Thank you for the amazing adventure, Blip," said Emma as she climbed back into her room, clutching Cosmo
          tightly.
        </p>

        <p className="text-xl leading-relaxed mb-6">
          "The pleasure was all mine, Space Explorer Emma," beeped Blip with a friendly wave. "Remember to look for your
          special star!"
        </p>

        <p className="text-xl leading-relaxed mb-6">
          As the spaceship disappeared into the night, Emma rushed to her window and looked up. There, twinkling
          brightly above her house, was her very own purple and blue star. She smiled, knowing that her space adventure
          would always be there, shining down on her, whenever she looked up at the night sky.
        </p>

        <p className="text-2xl font-medium text-center mt-10 mb-6">The End</p>
      </div>
    </div>
  )
}


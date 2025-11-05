import { Button } from "@/components/ui/button"
import Image from "next/image"
import { FaPhoneAlt } from "react-icons/fa"

export default function HeroAbout() {
    return (
        <section className="py-12 md:py-16 pt-32 md:pt-40 dark:bg-dark transition-colors duration-300">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-4 md:space-y-6">
                    <p className="text-gray-400 dark:text-gray-500 text-base md:text-lg font-medium transition-colors duration-300">About Us</p>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
                    We Are
                    <br />
                    Software House 
                    <br />
                    & Digital Agency{" "}
                    <br />
                    <span className="bg-gradient-to-r from-white  to-primary via-white text-gray-900 pr-8 py-2  rounded-full dark:from-dark dark:to-primary dark:text-white inline-block">
                    Genfity
                    </span>
                    </h1>

                    <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed max-w-lg transition-colors duration-300">
                    Founded in 2022, Genfity provides website development, digital marketing, branding, and SEO services.
                    We focus on service quality and continuous optimization, consistently delivering the best for our clients.
                    To date, Genfity has served thousands of customers both domestically and internationally.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                    <Button 
                        className="rounded-full px-8"
                        variant="default"
                        
                    >
                            Our Service
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-full px-8 dark:border-gray-400"
                    >
                        <FaPhoneAlt className="mr-2" />
                        Contact Us
                    </Button>
                    </div>
                </div>

                {/* Right Content - Team Photos with Stats */}
                <div className="relative">
                    <div className="">
                    {/* Top Left - Team stat */}
                    <div className="relative">
                        <Image
                        src="/images/about/gambar-hero-about-1.png"
                        alt="Team meeting"
                        width={400}
                        height={300}
                        className="w-full max-h-[450px] object-cover rounded-lg "
                        />
                        <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 md:px-4 py-2 md:py-3 rounded-lg shadow-xl max-w-[120px] md:max-w-[140px] border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="text-xs md:text-sm font-semibold leading-tight">
                            Empowering Your Business with Digital Innovation
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">www.genfity.com</div>
                        </div>
                    </div>

                    {/* <div className="relative mt-4 md:mt-8">
                        <Image
                        src="/images/about/gambar-hero-about-2.png"
                        alt="Large team"
                        width={400}
                        height={300}
                        className="w-full h-24 sm:h-32 md:h-40 lg:h-48 object-cover rounded-lg grayscale hover:grayscale-0 transition-all duration-300"
                        />
                    </div>

                    <div className="relative -mt-2 md:-mt-4">
                        <Image
                        src="/images/about/gambar-hero-about-3.png"
                        alt="Business team"
                        width={400}
                        height={300}
                        className="w-full h-24 sm:h-32 md:h-40 lg:h-48 object-cover rounded-lg grayscale hover:grayscale-0 transition-all duration-300"
                        />
                    </div>

                    <div className="relative">
                        <Image
                        src="/images/about/gambar-hero-about-3.png"
                        alt="Team collaboration"
                        width={400}
                        height={300}
                        className="w-full h-24 sm:h-32 md:h-40 lg:h-48 object-cover rounded-lg grayscale hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 md:px-4 py-2 md:py-3 rounded-lg shadow-xl max-w-[120px] md:max-w-[140px] border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="text-xs md:text-sm font-semibold leading-tight">
                            Empowering Your Business with Digital Innovation
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">www.genfity.com</div>
                        </div>
                    </div> */}
                    </div>
                </div>
                </div>
            </div>
        </section>
    )
}

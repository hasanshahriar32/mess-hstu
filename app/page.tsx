"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Users, Phone, Mail, Building2, ArrowRight, CheckCircle, Shield, Clock, Heart, DownloadCloud, Menu, X, UserPlus, Home, LogOut, User, Code } from "lucide-react"
import { OnlineStatus } from "@/components/online-status"
import { NotificationPermission } from "@/components/notification-permission"
import { logout } from "@/lib/auth-utils"

const locations = [
	{
		id: "mohabolipur-boys",
		title: "Mohabolipur Boys",
		description: "Premium accommodation for male students in the heart of Mohabolipur",
		image: "/images/boys-mess-building.png",
		color: "from-blue-600 to-cyan-600",
		bgColor: "from-blue-50 to-cyan-50",
		category: "boys",
		location: "mohabolipur",
	},
	{
		id: "mohabolipur-girls",
		title: "Mohabolipur Girls",
		description: "Safe and secure facilities for female students with enhanced security",
		image: "/images/girls-mess-building.png",
		color: "from-pink-600 to-rose-600",
		bgColor: "from-pink-50 to-rose-50",
		category: "girls",
		location: "mohabolipur",
	},
	{
		id: "bcs-gali-boys",
		title: "BCS Gali Boys",
		description: "Convenient location with easy access to campus and local amenities",
		image: "/images/boys-mess-building.png",
		color: "from-blue-600 to-cyan-600",
		bgColor: "from-blue-50 to-cyan-50",
		category: "boys",
		location: "bcs-gali",
	},
	{
		id: "bcs-gali-girls",
		title: "BCS Gali Girls",
		description: "Well-maintained facilities in a comfortable environment",
		image: "/images/girls-mess-building.png",
		color: "from-pink-600 to-rose-600",
		bgColor: "from-pink-50 to-rose-50",
		category: "girls",
		location: "bcs-gali",
	},
	{
		id: "kornai-boys",
		title: "Kornai Boys",
		description: "Peaceful environment perfect for focused studies",
		image: "/images/boys-mess-building.png",
		color: "from-blue-600 to-cyan-600",
		bgColor: "from-blue-50 to-cyan-50",
		category: "boys",
		location: "kornai",
	},
	{
		id: "kornai-girls",
		title: "Kornai Girls",
		description: "Beautiful and safe accommodation with homely atmosphere",
		image: "/images/girls-mess-building.png",
		color: "from-pink-600 to-rose-600",
		bgColor: "from-pink-50 to-rose-50",
		category: "girls",
		location: "kornai",
	},
]

const features = [
	{
		icon: Shield,
		title: "Safe & Secure",
		description: "24/7 security and CCTV monitoring for your peace of mind",
	},
	{
		icon: Users,
		title: "Community Living",
		description: "Connect with fellow students in a friendly environment",
	},
	{
		icon: Clock,
		title: "24/7 Support",
		description: "Round-the-clock assistance for all your needs",
	},
	{
		icon: CheckCircle,
		title: "Quality Assured",
		description: "Verified listings with authentic reviews and ratings",
	},
]

// --- Types for PWA install event ---
type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// PWA Install Hook
function usePWAInstall() {
	const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
	const [showInstall, setShowInstall] = useState(false)
	const [isInstalled, setIsInstalled] = useState(false)

	useEffect(() => {
		if (typeof window === "undefined") return

		// Check if app is already installed
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches
		const isInWebAppiOS = (window.navigator as any).standalone === true
		const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches
		
		if (isStandalone || isInWebAppiOS || isInWebAppChrome) {
			setIsInstalled(true)
			return
		}

		// Listen for install prompt
		const handler = (e: Event) => {
			e.preventDefault()
			setDeferredPrompt(e as BeforeInstallPromptEvent)
			setShowInstall(true)
		}

		// Listen for successful install
		const appInstalledHandler = () => {
			setIsInstalled(true)
			setShowInstall(false)
			setDeferredPrompt(null)
		}

		window.addEventListener("beforeinstallprompt", handler)
		window.addEventListener("appinstalled", appInstalledHandler)

		return () => {
			window.removeEventListener("beforeinstallprompt", handler)
			window.removeEventListener("appinstalled", appInstalledHandler)
		}
	}, [])

	const handleInstallClick = async () => {
		if (!deferredPrompt) return
		
		try {
			await deferredPrompt.prompt()
			const { outcome } = await deferredPrompt.userChoice
			
			if (outcome === "accepted") {
				setShowInstall(false)
				setDeferredPrompt(null)
			}
		} catch (error) {
			console.error("Error during PWA install:", error)
		}
	}

	return {
		showInstall,
		isInstalled,
		handleInstallClick
	}
}

// Simple mobile menu for homepage
function MobileMenu() {
	const [open, setOpen] = useState(false)
	return (
		<div className="relative">
			<Button variant="outline" size="icon" onClick={() => setOpen((open) => !open)} aria-label="Open menu">
				{open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
			</Button>
			{open && (
				<div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
					<Link href="/owner/login">
						<Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
							<UserPlus className="w-4 h-4 mr-2" /> Login
						</Button>
					</Link>
					<Link href="/owner/signup">
						<Button variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
							List Your Mess
						</Button>
					</Link>
				</div>
			)}
		</div>
	)
}

// Main page component
export default function HomePage() {
	const { showInstall, isInstalled, handleInstallClick } = usePWAInstall()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [user, setUser] = useState<{ role: string } | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const user = localStorage.getItem("user");
			setUser(user ? JSON.parse(user) : null);
		}
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<OnlineStatus />
			{/* Navigation */}
			<nav className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Link href="/" className="text-2xl font-bold text-slate-800">
							HSTU Mess Finder
						</Link>
						{/* Desktop nav */}
						<div className="hidden sm:flex items-center gap-4">
							<Link href="/">
								<Button variant="outline" size="sm">
									<Home className="w-4 h-4 mr-2" />
									Home
								</Button>
							</Link>
							{user ? (
								<div className="relative">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
									>
										Profile
									</Button>
									{mobileMenuOpen && (
										<div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
											<Link href="/user">
												<Button variant="ghost" className="w-full justify-start">
													Profile
												</Button>
											</Link>
											{user.role === "owner" && (
												<Link href="/admin/dashboard">
													<Button variant="ghost" className="w-full justify-start">
														Admin Dashboard
													</Button>
												</Link>
											)}
											<Button 
												variant="ghost" 
												className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
												onClick={logout}
											>
												<LogOut className="w-4 h-4 mr-2" />
												Logout
											</Button>
										</div>
									)}
								</div>
							) : (
								<Link href="/owner/login">
									<Button variant="outline" size="sm">
										Login
									</Button>
								</Link>
							)}
						</div>
						{/* Mobile nav */}
						<div className="sm:hidden">
							<MobileMenu />
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-red-600/10"></div>
				<div className="relative container mx-auto px-4 py-20">
					<div className="text-center max-w-4xl mx-auto">
						<h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
							Find Your Perfect
							<span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Mess</span>
						</h1>
						<p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
							Discover comfortable, affordable, and safe accommodation options near HSTU campus. Connect with verified
							mess owners and find your home away from home.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
							<Button
								size="lg"
								className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
							>
								<MapPin className="w-5 h-5 mr-2" />
								Browse Locations
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="px-8 py-4 text-lg border-2 hover:bg-slate-50 bg-transparent"
							>
								<Phone className="w-5 h-5 mr-2" />
								Contact Support
							</Button>
						</div>
						{/* PWA Install Info and Button */}
						<div className="max-w-2xl mx-auto bg-white/80 rounded-xl shadow-lg p-6 border border-orange-100 mb-4 flex flex-col items-center">
							<div className="flex items-center gap-3 mb-2">
								<DownloadCloud className="w-8 h-8 text-orange-600" />
								<span className="text-xl font-semibold text-slate-800">
									{isInstalled ? "App Installed!" : "Install as App"}
								</span>
							</div>
							<p className="text-slate-600 mb-4 text-center">
								{isInstalled 
									? "You're using the installed app! Enjoy lightning-fast access and offline support."
									: "Enjoy lightning-fast access, offline support, and a native app experience. Install HSTU Mess Finder on your device for the best experience!"
								}
							</p>
							{showInstall && !isInstalled && (
								<Button
									size="lg"
									className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
									onClick={handleInstallClick}
								>
									<DownloadCloud className="w-5 h-5 mr-2" /> Install App
								</Button>
							)}
							{!showInstall && !isInstalled && (
								<div className="text-center">
									<span className="text-sm text-slate-500 block mb-2">
										Installation not available on this device/browser.
									</span>
									<p className="text-xs text-slate-400">
										For the best experience, try using Chrome, Edge, or Safari on Android/iOS.
									</p>
								</div>
							)}
							{isInstalled && (
								<div className="flex items-center text-green-600">
									<CheckCircle className="w-5 h-5 mr-2" />
									<span className="font-medium">Ready to use offline!</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-white/50">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-slate-800 mb-4">Why Choose HSTU Mess Finder?</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							We make finding the perfect accommodation simple, safe, and reliable for HSTU students
						</p>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<Card
								key={index}
								className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm"
							>
								<CardContent className="p-8 text-center">
									<div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
										<feature.icon className="w-8 h-8 text-orange-600" />
									</div>
									<h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
									<p className="text-slate-600 leading-relaxed">{feature.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Locations Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-slate-800 mb-4">Explore Locations</h2>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Choose from our carefully curated mess options across popular student areas near HSTU
						</p>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						{locations.map((location) => (
							<Link key={location.id} href={`/location/${location.id}`}>
								<Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer">
									<div className="relative h-48 overflow-hidden">
										<Image
											src={location.image || "/placeholder.svg"}
											alt={location.title}
											fill
											className="object-cover group-hover:scale-110 transition-transform duration-500"
										/>
										<div
											className={`absolute inset-0 bg-gradient-to-t ${location.color} opacity-60 group-hover:opacity-70 transition-opacity`}
										></div>
										<div className="absolute top-4 right-4">
											<Badge variant="secondary" className="bg-white/90 text-slate-700 capitalize">
												{location.category}
											</Badge>
										</div>
									</div>
									<CardContent className="p-6">
										<h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
											{location.title}
										</h3>
										<p className="text-slate-600 mb-4 leading-relaxed">{location.description}</p>
										<div className="flex items-center justify-between">
											<div className="flex items-center text-slate-500">
												<MapPin className="w-4 h-4 mr-1" />
												<span className="text-sm capitalize">{location.location.replace("-", " ")}</span>
											</div>
											<ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
				<div className="container mx-auto px-4 text-center">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-4xl font-bold text-white mb-6">Ready to Find Your Perfect Mess?</h2>
						<p className="text-xl text-white/90 mb-8 leading-relaxed">
							Join thousands of HSTU students who have found their ideal accommodation through our platform
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								size="lg"
								variant="secondary"
								className="bg-white text-orange-600 hover:bg-slate-50 px-8 py-4 text-lg font-semibold shadow-xl"
							>
								<Building2 className="w-5 h-5 mr-2" />
								Browse All Locations
							</Button>
							<Link href="/owner/signup">
								<Button
									size="lg"
									variant="outline"
									className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg font-semibold bg-transparent"
								>
									<Heart className="w-5 h-5 mr-2" />
									List Your Property
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						<div className="md:col-span-2">
							<div className="flex items-center space-x-2 mb-6">
								<Building2 className="w-8 h-8 text-orange-400" />
								<span className="text-2xl font-bold">HSTU Mess Finder</span>
							</div>
							<p className="text-slate-400 leading-relaxed mb-6 max-w-md">
								Your trusted platform for finding safe, comfortable, and affordable mess accommodation near HSTU campus.
								Connecting students with verified mess owners since 2025.
							</p>
							<div className="flex space-x-4">
		
								{/* <Link href="/developer">
									<Button
										variant="outline"
										size="sm"
										className="group border-2 border-orange-500/30 text-orange-400 hover:text-white hover:border-orange-400 hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 bg-transparent transition-all duration-300 shadow-lg hover:shadow-xl"
									>
										<Code className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
										Meet Developer
									</Button>
								</Link> */}
							</div>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-4">Quick Links</h3>
							<ul className="space-y-2 text-slate-400">
								<li>
									<Link href="/location/mohabolipur-boys" className="hover:text-white transition-colors">
										Mohabolipur Boys
									</Link>
								</li>
								<li>
									<Link href="/location/mohabolipur-girls" className="hover:text-white transition-colors">
										Mohabolipur Girls
									</Link>
								</li>
								<li>
									<Link href="/location/bcs-gali-boys" className="hover:text-white transition-colors">
										BCS Gali Boys
									</Link>
								</li>
								<li>
									<Link href="/location/bcs-gali-girls" className="hover:text-white transition-colors">
										BCS Gali Girls
									</Link>
								</li>
								<li>
									<Link href="/location/kornai-boys" className="hover:text-white transition-colors">
										Kornai Boys
									</Link>
								</li>
								<li>
									<Link href="/location/kornai-girls" className="hover:text-white transition-colors">
										Kornai Girls
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-4">For Owners</h3>
							<ul className="space-y-2 text-slate-400">
								<li>
									<Link href="/owner/signup" className="hover:text-white transition-colors">
										List Your Mess
									</Link>
								</li>
								<li>
									<Link href="/owner/login" className="hover:text-white transition-colors">
										Login
									</Link>
								</li>
								<li>
									<Link href="/admin/dashboard" className="hover:text-white transition-colors">
										Dashboard
									</Link>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Pricing
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										Support
									</a>
								</li>
							</ul>
						</div>
					</div>

					<Separator className="bg-slate-700 mb-8" />

					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-slate-400 mb-4 md:mb-0">&copy; 2025 HSTU Mess Finder. All rights reserved.</p>
						<p className="text-slate-500">
							Developed with{" "}
							<Heart className="w-4 h-4 inline text-red-400" /> by{" "}
							<span className="text-orange-400 font-medium">Ashikul Islam</span>
						</p>
					</div>
				</div>
			</footer>
			<NotificationPermission />
		</div>
	)
}

"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { InteractiveCard } from "@/components/ui/InteractiveCard";
import { FloatingParticles } from "@/components/ui/FloatingParticles";
import { InteractiveDiagnosisSection } from "@/components/sections/InteractiveDiagnosisSection";
import { 
  Eye, 
  Shield, 
  Zap, 
  Users, 
  CheckCircle, 
  Upload, 
  Brain, 
  FileText,
  Star,
  ArrowRight,
  Sparkles,
  Clock,
  Award
} from "lucide-react";

// Dynamic import for Spline to avoid SSR issues
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-[#00ADB5]/30 border-t-[#00ADB5] rounded-full animate-spin" />
    </div>
  )
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Floating Particles Background */}
      <FloatingParticles count={15} />
      
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#00ADB5]/10 to-[#00ADB5]/20 border border-[#00ADB5]/30 mb-6">
                <Sparkles className="w-4 h-4 text-[#00ADB5]" />
                <span className="text-sm font-medium text-[#00ADB5]">AI-Powered Detection</span>
              </motion.div>
              
              <motion.h1
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground"
              >
                Deteksi{" "}
                <span className="bg-gradient-to-r from-[#00ADB5] to-[#00ADB5]/80 bg-clip-text text-transparent">
                  Diabetic Retinopathy
                </span>
                <br />
                dengan AI Modern
              </motion.h1>
              
              <motion.p
                variants={itemVariants}
                className="mt-4 sm:mt-6 text-base sm:text-lg text-foreground/70 leading-relaxed max-w-xl"
              >
                Platform cerdas untuk deteksi dini Diabetic Retinopathy menggunakan kecerdasan buatan. 
                Membantu tim medis dan pasien dengan analisis cepat, akurat, dan mudah digunakan.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Link
                  href="/auth/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#00ADB5] to-[#00ADB5]/90 px-6 sm:px-8 text-white font-medium hover:shadow-lg hover:shadow-[#00ADB5]/25 hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  Mulai Gratis
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-foreground/20 px-6 sm:px-8 font-medium text-foreground hover:bg-foreground/5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Masuk
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6"
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[#00ADB5]">99.2%</div>
                  <div className="text-xs sm:text-sm text-foreground/60">Akurasi</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[#00ADB5]">{"< 2s"}</div>
                  <div className="text-xs sm:text-sm text-foreground/60">Analisis</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[#00ADB5]">24/7</div>
                  <div className="text-xs sm:text-sm text-foreground/60">Available</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-[#00ADB5]/10 via-transparent to-[#393E46]/10 p-8 backdrop-blur">
                <div className="h-full w-full rounded-2xl bg-gradient-to-br from-white/50 to-white/20 dark:from-[#222831]/50 dark:to-[#222831]/20 backdrop-blur border border-white/20 dark:border-[#393E46]/20 shadow-2xl relative overflow-hidden">
                  {/* Spline 3D Animation */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <Spline
                      scene="https://prod.spline.design/LMAoumzYRMMD1mJU/scene.splinecode"
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'transparent'
                      }}
                    />
                  </div>
                  
                  {/* Floating elements with enhanced animations */}
                  <motion.div
                    animate={{ 
                      y: [-15, 15, -15],
                      rotate: [0, 5, 0, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      times: [0, 0.5, 1]
                    }}
                    className="absolute top-6 right-6 p-3 rounded-xl bg-gradient-to-br from-[#00ADB5]/30 to-[#00ADB5]/10 backdrop-blur-md border border-[#00ADB5]/20 shadow-lg"
                  >
                    <Brain className="w-6 h-6 text-[#00ADB5] drop-shadow-sm" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ 
                      y: [15, -15, 15],
                      rotate: [0, -5, 0, 5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 5, 
                      repeat: Infinity, 
                      ease: "easeInOut", 
                      delay: 1.5,
                      times: [0, 0.5, 1]
                    }}
                    className="absolute bottom-6 left-6 p-3 rounded-xl bg-gradient-to-br from-[#393E46]/30 to-[#393E46]/10 backdrop-blur-md border border-[#393E46]/20 shadow-lg"
                  >
                    <Shield className="w-6 h-6 text-[#393E46] drop-shadow-sm" />
                  </motion.div>

                  {/* Additional floating particle effects */}
                  <motion.div
                    animate={{ 
                      x: [-20, 20, -20],
                      y: [-10, 10, -10],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 2
                    }}
                    className="absolute top-1/2 left-4 w-2 h-2 bg-[#00ADB5] rounded-full blur-sm"
                  />
                  
                  <motion.div
                    animate={{ 
                      x: [20, -20, 20],
                      y: [10, -10, 10],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 7, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 3
                    }}
                    className="absolute bottom-1/3 right-8 w-1 h-1 bg-[#393E46] rounded-full blur-sm"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* How it Works Section */}
      <HowItWorksSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Interactive Diagnosis Section */}
      <InteractiveDiagnosisSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-12 bg-gradient-to-b from-transparent to-foreground/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-[#00ADB5]" />
              <span className="font-semibold text-lg">RetinaAI</span>
            </div>
            <div className="text-sm text-foreground/60">
              © {new Date().getFullYear()} RetinaAI. Deteksi Diabetic Retinopathy dengan AI.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const features = [
    {
      icon: Eye,
      title: "Deteksi AI Canggih",
      desc: "Algoritma deep learning terdepan untuk analisis retina dengan akurasi tinggi"
    },
    {
      icon: Zap,
      title: "Hasil Instan",
      desc: "Dapatkan hasil analisis dalam hitungan detik, tidak perlu menunggu lama"
    },
    {
      icon: Shield,
      title: "Keamanan Terjamin",
      desc: "Data medis terenkripsi dan tersimpan aman sesuai standar HIPAA"
    },
    {
      icon: Users,
      title: "Multi Role Access",
      desc: "Dashboard terpisah untuk tim medis (Admin) dan pasien dengan fitur khusus"
    }
  ];

  return (
    <section ref={ref} className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-transparent to-foreground/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Mengapa Memilih <span className="text-[#00ADB5]">RetinaAI</span>?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto px-4">
            Teknologi terdepan untuk deteksi dini Diabetic Retinopathy dengan pengalaman pengguna yang luar biasa
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
            >
              <InteractiveCard
                className="p-6 rounded-2xl bg-white/90 dark:bg-[#222831]/90 backdrop-blur border border-foreground/10 h-full shadow-lg"
                hoverScale={1.05}
                glowColor="#00ADB5"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ADB5]/20 to-[#00ADB5]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#00ADB5] transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#EEEEEE] mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-[#EEEEEE]/70 text-sm leading-relaxed">{feature.desc}</p>
              </InteractiveCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const steps = [
    { icon: Upload, title: "Upload Gambar", desc: "Tim medis mengupload hasil scan retina pasien ke sistem" },
    { icon: Brain, title: "Analisis AI", desc: "Sistem AI menganalisis gambar menggunakan deep learning" },
    { icon: FileText, title: "Laporan Hasil", desc: "Hasil deteksi tersedia untuk tim medis dan pasien" }
  ];

  return (
    <section ref={ref} className="py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Bagaimana <span className="text-[#00ADB5]">RetinaAI</span> Bekerja?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto px-4">
            Proses sederhana dalam 3 langkah untuk deteksi Diabetic Retinopathy yang akurat
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="relative text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#00ADB5] to-[#00ADB5]/80 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-[#00ADB5]/25">
                <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">{step.title}</h3>
              <p className="text-sm sm:text-base text-foreground/70 leading-relaxed px-2">{step.desc}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full">
                  <ArrowRight className="w-6 h-6 text-[#00ADB5]/50 mx-auto" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const stats = [
    { value: "10,000+", label: "Diagnosa Selesai", icon: CheckCircle },
    { value: "500+", label: "Tim Medis", icon: Users },
    { value: "99.2%", label: "Tingkat Akurasi", icon: Award },
    { value: "< 2 detik", label: "Waktu Analisis", icon: Clock }
  ];

  return (
    <section ref={ref} className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[#00ADB5]/5 via-transparent to-[#393E46]/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="text-center group"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#00ADB5]/10 to-[#00ADB5]/5 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#00ADB5]" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">{stat.value}</div>
              <div className="text-xs sm:text-sm text-foreground/70">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const testimonials = [
    {
      name: "Dr. Sarah Wilson",
      role: "Ophthalmologist",
      content: "RetinaAI telah mengubah cara kami melakukan screening. Akurasi yang luar biasa dan sangat mudah digunakan.",
      rating: 5
    },
    {
      name: "Ahmad Fauzi",
      role: "Pasien Diabetes",
      content: "Proses pemeriksaan jadi lebih cepat dan saya bisa melihat hasil langsung. Interface yang sangat user-friendly.",
      rating: 5
    }
  ];

  return (
    <section ref={ref} className="py-12 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Testimoni <span className="text-[#00ADB5]">Pengguna</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
            >
              <InteractiveCard
                className="p-4 sm:p-6 rounded-2xl bg-white/90 dark:bg-[#222831]/90 backdrop-blur border border-foreground/10 h-full shadow-lg"
                hoverScale={1.03}
                glowColor="#393E46"
              >
                <div className="flex mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                    >
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#00ADB5] text-[#00ADB5]" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-[#EEEEEE]/80 mb-3 sm:mb-4 italic leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-[#EEEEEE]">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-[#EEEEEE]/60">{testimonial.role}</div>
                </div>
              </InteractiveCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <section ref={ref} className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-[#00ADB5]/10 via-[#00ADB5]/5 to-transparent">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6">
            Siap Memulai Deteksi dengan <span className="text-[#00ADB5]">RetinaAI</span>?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-base sm:text-lg text-foreground/70 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Bergabunglah dengan ribuan profesional medis yang sudah menggunakan RetinaAI untuk deteksi dini Diabetic Retinopathy
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link
              href="/auth/register"
              className="inline-flex h-11 sm:h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#00ADB5] to-[#00ADB5]/90 px-6 sm:px-8 text-sm sm:text-base text-white font-medium hover:shadow-lg hover:shadow-[#00ADB5]/25 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              Mulai Sekarang
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex h-11 sm:h-12 items-center justify-center rounded-xl border border-foreground/20 px-6 sm:px-8 text-sm sm:text-base font-medium text-foreground hover:bg-foreground/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              Sudah Punya Akun?
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

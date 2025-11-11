"use client";

import { motion, useScroll, useTransform, useDragControls, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Brain, AlertTriangle, CheckCircle, Microscope, TrendingUp, Zap } from "lucide-react";

interface DiagnosisStage {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  severity: "normal" | "mild" | "moderate" | "severe";
  progress: number;
}

const diagnosisStages: DiagnosisStage[] = [
  {
    id: 0,
    title: "No DR",
    description: "Retina dalam kondisi sehat tanpa tanda-tanda diabetic retinopathy",
    icon: CheckCircle,
    color: "#00C851",
    severity: "normal",
    progress: 0
  },
  {
    id: 1,
    title: "Mild DR", 
    description: "Diabetic retinopathy ringan dengan beberapa mikroaneurisma kecil",
    icon: Brain,
    color: "#FFD700",
    severity: "mild",
    progress: 25
  },
  {
    id: 2,
    title: "Moderate DR",
    description: "Diabetic retinopathy sedang dengan perdarahan dan eksudat yang lebih jelas",
    icon: Microscope,
    color: "#FF8C00", 
    severity: "moderate",
    progress: 50
  },
  {
    id: 3,
    title: "Severe DR",
    description: "Diabetic retinopathy berat dengan area iskemia yang signifikan",
    icon: AlertTriangle,
    color: "#FF4444",
    severity: "severe", 
    progress: 75
  },
  {
    id: 4,
    title: "Proliferative DR",
    description: "Diabetic retinopathy proliferatif dengan neovaskularisasi - memerlukan tindakan segera",
    icon: TrendingUp,
    color: "#CC0000",
    severity: "severe",
    progress: 100
  }
];

export function InteractiveDiagnosisSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsContainerRef = useRef<HTMLDivElement>(null);
  const [activeStage, setActiveStage] = useState<DiagnosisStage | null>(null);
  const [draggedStage, setDraggedStage] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  // Analysis simulation
  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveStage(diagnosisStages[Math.floor(Math.random() * diagnosisStages.length)]);
    }, 3000);
  };

  return (
    <section ref={containerRef} className="py-12 sm:py-24 relative overflow-hidden bg-gradient-to-br from-background via-background to-[#00ADB5]/5">
      {/* Animated Background Elements */}
      <motion.div
        style={{ y: y1, rotate }}
        className="absolute top-20 left-4 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[#00ADB5]/10 to-transparent rounded-full blur-xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-20 right-4 sm:right-10 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-[#393E46]/10 to-transparent rounded-full blur-xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-6"
          >
            <Microscope className="w-16 h-16 text-[#00ADB5] mx-auto" />
          </motion.div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Diagnosis Interaktif
            <span className="block text-[#00ADB5]">Retinopati Diabetik</span>
          </h2>
          <p className="text-lg sm:text-xl text-foreground/70 max-w-3xl mx-auto px-4">
            Jelajahi tahapan diagnosis retinopati diabetik dengan teknologi AI. 
            <span className="hidden sm:inline">Drag dan drop elemen untuk mempelajari lebih lanjut tentang setiap tahap.</span>
            <span className="sm:hidden">Tap elemen untuk mempelajari lebih lanjut tentang setiap tahap.</span>
          </p>
        </motion.div>

        {/* Interactive Analysis Center */}
        <motion.div 
          style={{ scale }}
          className="relative mb-16"
        >
          <motion.div
            className="mx-auto w-64 h-64 sm:w-80 sm:h-80 md:max-w-md md:aspect-square rounded-full bg-gradient-to-br from-[#00ADB5]/20 to-[#EEEEEE]/40 dark:to-[#393E46]/20 backdrop-blur-sm border-2 border-[#00ADB5]/30 flex items-center justify-center relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Scanning Animation */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border-4 border-transparent border-t-[#00ADB5] rounded-full"
                />
              )}
            </AnimatePresence>

            {/* Analysis Button */}
            <motion.button
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#00ADB5] to-[#393E46] text-white font-bold text-sm sm:text-lg shadow-2xl disabled:opacity-50"
              whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(0,173,181,0.5)" }}
              whileTap={{ scale: 0.95 }}
              animate={isAnalyzing ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isAnalyzing ? Infinity : 0 }}
            >
              {isAnalyzing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-8 h-8 mx-auto" />
                </motion.div>
              ) : (
                <>
                  <Zap className="w-8 h-8 mx-auto mb-2" />
                  Analisis AI
                </>
              )}
            </motion.button>

            {/* Result Display */}
            <AnimatePresence>
              {activeStage && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0, rotate: 180 }}
                  className="absolute inset-0 flex items-center justify-center bg-[#EEEEEE]/95 dark:bg-[#222831]/90 backdrop-blur rounded-full"
                >
                  <div className="text-center p-4">
                    <activeStage.icon 
                      className="w-12 h-12 mx-auto mb-2" 
                      style={{ color: activeStage.color }}
                    />
                    <h3 className="text-lg font-bold text-white dark:text-foreground mb-1">{activeStage.title}</h3>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mx-auto">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activeStage.progress}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: activeStage.color }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Orbiting Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-[#00ADB5] rounded-full"
                style={{
                  top: "50%",
                  left: "50%",
                  transformOrigin: "0 0"
                }}
                animate={{
                  rotate: 360,
                  x: Math.cos(i * 60 * Math.PI / 180) * 120,
                  y: Math.sin(i * 60 * Math.PI / 180) * 120
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Draggable Diagnosis Stages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {diagnosisStages.map((stage, index) => (
            <DiagniosisCard
              key={stage.id}
              stage={stage}
              index={index}
              isActive={activeStage?.id === stage.id}
              isDragged={draggedStage === stage.id}
              onDragStart={() => setDraggedStage(stage.id)}
              onDragEnd={() => setDraggedStage(null)}
              onHover={() => setActiveStage(stage)}
            />
          ))}
        </div>

        {/* AI Analysis Metrics */}
        <motion.div
          ref={metricsContainerRef}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8"
        >
          {[
            { label: "Model Accuracy", value: "97.2%", icon: TrendingUp },
            { label: "5-Class Detection", value: "DenseNet201", icon: Brain },
            { label: "Processing Time", value: "< 2s", icon: Zap }
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              drag={isDesktop}
              dragConstraints={metricsContainerRef}
              dragElastic={0.1}
              dragMomentum={false}
              className="text-center p-6 rounded-2xl bg-white/90 dark:bg-[#222831]/90 backdrop-blur border border-foreground/10 shadow-lg md:cursor-grab md:active:cursor-grabbing touch-none select-none"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px -10px rgba(0,173,181,0.3)"
              }}
              whileDrag={{
                scale: 1.1,
                rotate: 5,
                zIndex: 50,
                boxShadow: "0 25px 50px -12px rgba(0,173,181,0.4)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              >
                <metric.icon className="w-8 h-8 text-[#00ADB5] mx-auto mb-4" />
              </motion.div>
              <motion.div
                className="text-2xl font-bold text-gray-900 dark:text-[#EEEEEE]">{metric.value}</motion.div>
              <div className="text-sm text-gray-600 dark:text-[#EEEEEE]/60 mt-1">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface DiagnosisCardProps {
  stage: DiagnosisStage;
  index: number;
  isActive: boolean;
  isDragged: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onHover: () => void;
}

function DiagniosisCard({ 
  stage, 
  index, 
  isActive,
  onDragStart,
  onDragEnd,
  onHover
}: DiagnosisCardProps) {
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragElastic={0.2}
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      style={{ x: springX, y: springY }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onHoverStart={onHover}
      className="cursor-grab active:cursor-grabbing"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileDrag={{ 
        scale: 1.1, 
        rotate: 5,
        zIndex: 50,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
      }}
      whileHover={{ 
        scale: 1.05,
        y: -10
      }}
    >
      <div 
        className={`p-6 rounded-2xl backdrop-blur border-2 transition-all duration-300 ${
          isActive 
            ? 'bg-white/95 dark:bg-[#222831]/90 border-[#00ADB5] shadow-lg' 
            : 'bg-white/90 dark:bg-[#222831]/80 border-foreground/10 shadow-md'
        }`}
        style={{
          boxShadow: isActive ? `0 0 30px ${stage.color}40` : undefined
        }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${stage.color}20, ${stage.color}10)`
          }}
          animate={isActive ? { 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <stage.icon 
            className="w-8 h-8"
            style={{ color: stage.color }}
          />
        </motion.div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-[#EEEEEE] mb-3 text-center">
          {stage.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-[#EEEEEE]/70 text-center mb-4 leading-relaxed">
          {stage.description}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: stage.color }}
            initial={{ width: 0 }}
            whileInView={{ width: `${stage.progress}%` }}
            viewport={{ once: false }}
            transition={{ duration: 1, delay: index * 0.2 }}
          />
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500 dark:text-[#EEEEEE]/60 capitalize">
            {stage.severity}
          </span>
          <span className="text-xs font-medium" style={{ color: stage.color }}>
            {stage.progress}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

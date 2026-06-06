import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CloudRain, Star, ShoppingBag, ShieldCheck, Phone, CheckCircle2, 
  MapPin, Clock, ArrowDown, ChevronRight, HelpCircle, Heart, Settings, 
  Smartphone, Award, Flame, ThumbsUp, Volume2, Info, MessageCircle
} from 'lucide-react';
import SizingChart from './components/SizingChart';
import ReviewsList from './components/ReviewsList';
import OrderForm from './components/OrderForm';
import Receipt from './components/Receipt';
import AdminPanel from './components/AdminPanel';
import ProductCarousel from './components/ProductCarousel';
import { Size, ProductColor, RaincoatOrder } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { getSheetsConfig, getAccessToken, appendOrderToSheet } from './lib/googleSheets';

export default function App() {
  const [selectedSize, setSelectedSize] = useState<Size>('XXL');
  const [selectedColor, setSelectedColor] = useState<ProductColor>('Navy Blue');
  const [submittedOrder, setSubmittedOrder] = useState<RaincoatOrder | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);

  // Generate rain drops positions
  const [rainDrops, setRainDrops] = useState<{ left: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate rain particles configurations
    const drops = Array.from({ length: 35 }).map(() => ({
      left: Math.random() * 100 + '%',
      delay: Math.random() * 2 + 's',
      duration: 1 + Math.random() * 1.5 + 's'
    }));
    setRainDrops(drops);

    // Initial load and sync orders count
    const listJson = localStorage.getItem('raincoat_orders') || '[]';
    setOrdersCount(JSON.parse(listJson).length);

    // Dynamically inject Facebook SDK script
    const fbScript = document.createElement('script');
    fbScript.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
    fbScript.async = true;
    fbScript.defer = true;
    fbScript.crossOrigin = "anonymous";
    document.body.appendChild(fbScript);

    fbScript.onload = () => {
      if ((window as any).FB) {
        (window as any).FB.XFBML.parse();
      }
    };

    return () => {
      document.body.removeChild(fbScript);
    };
  }, []);

  const refreshOrdersCount = () => {
    const listJson = localStorage.getItem('raincoat_orders') || '[]';
    setOrdersCount(JSON.parse(listJson).length);
  };

  const handleOrderCreated = (order: RaincoatOrder) => {
    setSubmittedOrder(order);
    refreshOrdersCount();

    // Auto Google Sheets sync if enabled and authenticated
    const sheetsCfg = getSheetsConfig();
    const token = getAccessToken();
    if (sheetsCfg.autoSync && sheetsCfg.spreadsheetId && token) {
      appendOrderToSheet(token, sheetsCfg.spreadsheetId, order)
        .then(success => {
          if (success) {
            console.log('Successfully appended newly placed order directly to Google Sheets!');
          } else {
            console.warn('Failed to auto append placed order to Google Sheets. Check Spreadsheet ID/permissions.');
          }
        })
        .catch(err => {
          console.error('Error during auto-sync of order to Google Sheets:', err);
        });
    }

    // Smooth scroll back to order review
    const element = document.getElementById('checkout-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBackToShopping = () => {
    setSubmittedOrder(null);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* FB Root Element for official Facebook SDK */}
      <div id="fb-root"></div>

      {/* Top Urgent Alert Strip */}
      <div className="bg-gradient-to-r from-orange-600 via-rose-500 to-blue-900 text-white text-xs sm:text-sm font-bold text-center py-2 px-4 shadow-sm flex items-center justify-center gap-2 relative z-40 font-sans">
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] sm:text-xs animate-pulse text-amber-200">অফার এলার্ট!</span>
        <span>🌧️ বর্ষা ধামাকা ২০% ছাড়! ডেলিভারি চার্জ সহ সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD)! 🌧️</span>
        <button
          onClick={() => scrollToSection('checkout-form')}
          className="underline hover:text-orange-200 transition font-extrabold cursor-pointer hidden sm:inline-block ml-4"
        >
          অর্ডার করুন এখন
        </button>
      </div>

      {/* Elegant Header / Hero Section with animated rain backdrop */}
      <header className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800" id="home">
        {/* Animated Simulated Raindrops */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          {rainDrops.map((drop, idx) => (
            <div
              key={idx}
              className="rain-drop"
              style={{
                left: drop.left,
                animationDelay: drop.delay,
                animationDuration: drop.duration,
              }}
            />
          ))}
        </div>

        {/* Ambient Dark Mesh Blue glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* High-fidelity interactive Product Carousel showing real product images & features */}
            <div className="lg:col-span-5 relative w-full flex justify-center mt-6 lg:mt-0 order-first lg:order-last animate-fade-in">
              <ProductCarousel />
            </div>

            {/* Hero text content block */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left lg:order-first">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-550/10 text-orange-400 text-xs font-bold rounded-full border border-orange-500/20 uppercase tracking-widest font-sans">
                <CloudRain className="h-4 w-4 animate-bounce text-orange-400" /> ১০০% প্রিমিয়াম ওয়াটারপ্রুফ গিয়ার
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight font-sans">
                ঝুম বৃষ্টি কিংবা ঝড়ো হাওয়া— <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-200 to-white block mt-2">
                  বাইরে বের হতে আর কোনো ভয় নেই!
                </span>
              </h1>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
                আমরা নিয়ে এলাম সম্পূর্ণ থার্মাল হিট সিল প্রযুক্তির প্রিমিয়াম কোয়ালিটির রেইনকোট জ্যাকেট ও প্যান্টের এক দুর্দান্ত কম্বো! কোনো বাইরের সেলাই নেই, ফলে এক ফোটা পানিও কাপড়ে ঢোকার সুযোগ নেই।
              </p>

              {/* Dynamic offer bubble */}
              <div className="bg-slate-800/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-700/80 max-w-md mx-auto lg:mx-0 grid grid-cols-2 gap-4">
                <div className="text-center border-r border-slate-700 font-sans">
                  <span className="text-[10px] text-slate-400 block pb-1">XL & XXL সাইজ</span>
                  <span className="text-2xl font-black text-orange-400 font-mono">৯৯০/- TK</span>
                </div>
                <div className="text-center font-sans">
                  <span className="text-[10px] text-slate-400 block pb-1">3XL & 4XL সাইজ</span>
                  <span className="text-2xl font-black text-orange-400 font-mono">১০৯০/- TK</span>
                </div>
              </div>

              {/* Badges checklist */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2.5 pt-2 text-slate-300 text-xs font-semibold">
                <div className="flex items-center gap-1.5 font-sans">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-400" /> হিট সিল প্রযুক্তি
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-400" /> হাতের কব্জি রাবার গ্রিপ
                </div>
                <div className="flex items-center gap-1.5 font-sans">
                  <CheckCircle2 className="h-4.5 w-4.5 text-orange-400" /> ৩ বছর ব্যবহারের গ্যারান্টি
                </div>
              </div>

              {/* CTA buttons flow */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-3">
                <button
                  onClick={() => scrollToSection('checkout-form')}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl transition duration-300 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer animate-pulse-subtle"
                  id="hero-order-now"
                >
                  <ShoppingBag className="h-5 w-5" /> অর্ডার ফরম এ চলে যান (COD)
                </button>
                <button
                  onClick={() => scrollToSection('sizing-tool')}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-700 font-bold text-sm sm:text-base rounded-2xl transition duration-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  সাইজ ক্যালকুলেটর <ChevronRight className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Prominent Embedded Video Section */}
      <section className="py-12 bg-white border-b border-slate-100" id="live-video">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="max-w-2xl mx-auto mb-6">
            <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full border border-orange-200 inline-flex items-center gap-1 font-sans">
              <Volume2 className="h-3 w-3 animate-ping text-orange-500" /> হান্ড্রেড পার্সেন্ট রিয়েল লাইভ টেস্ট
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-sans">
              রেইনকোটটির কার্যকারিতা লাইভ ভিডিওতে দেখুন! 🔥
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-sans">
              এইটা কোনো সাধারণ প্লাস্টিক রেইনকোট নয়! বৃষ্টিতে কীভাবে শতভাগ পানি প্রতিরোধ করে তা সরাসরি দেখে নিন
            </p>
          </div>

          {/* Facebook Video Iframe embedded prominently inside high-quality device frame */}
          <div className="relative mx-auto max-w-[320px] bg-slate-950 border-[6px] border-slate-800 rounded-3xl shadow-2xl aspect-[9/16] overflow-hidden">
            {/* The actual FB Video embed parsed either through iframe or native SDK */}
            <iframe 
              src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1471402964313008%2F&show_text=false&width=500" 
              width="100%" 
              height="100%" 
              style={{ border: 'none', overflow: 'hidden' }} 
              scrolling="no" 
              frameBorder="0" 
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title="Premium Raincoat Live performance demo"
              className="absolute inset-0"
              id="fb-iframe-iframe"
            />
          </div>

          <div className="mt-4 flex justify-center gap-4 text-[11px] sm:text-xs font-sans text-slate-500">
            <span className="flex items-center gap-1">
              ⭐ ১২৭৮৫+ জন কৃষক, চাকরিজীবি ও বাইকার ভাইয়েদের প্রথম পছন্দ
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              💧 নিখুঁত ওয়াটার-গ্রিপিং ও ড্রিপ প্রুফ
            </span>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Showcase */}
      <section className="py-16 bg-slate-50 border-b border-slate-100" id="features">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest font-sans">কেন আমাদের রেইনকোট সেরা?</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-sans">
              শতভাগ সুরক্ষার জন্য প্রিমিয়াম ডিজাইন ও কোয়ালিটি ফিচার
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-sans">
              আলাদা জ্যকেট ও প্যান্টের এক চমত্কার সেলাই বিহীন কম্বিনেশন, যা কাদা বালি ও ঝড়ের ঝাপটা থেকে বাঁচাবে সম্পূর্ণ সুরক্ষিতভাবে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            {/* feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-lg transition-all duration-300">
              <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 font-extrabold text-xl mb-4">
                🫧
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-sans">১০০% ওয়াটারপ্রুফ ফেব্রিক্স</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                উন্নত মানের হাই-ডেন্সিটি ফেব্রিক্স দিয়ে নিখুঁত ফিনিশিং করা। টানা ভারী বৃষ্টির পিনপ্রিক ড্রপ ও কাদা জল নিষ্কাশন করতে ১০০% সমর্থ্য।
              </p>
            </div>

            {/* feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-lg transition-all duration-300">
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-extrabold text-xl mb-4">
                🔥
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-sans">থার্মাল হিট সিল প্রযুক্তি</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                কোনো সুই বা সুতোর ছিদ্র নেই! কাপড়ের জোড়গুলোতে থার্মাল হিট সিল ব্যবহার করার ফলে এর ভেতর দিয়ে এক ফোটা পানি বা ঝড়ো বাতাস ঢোকার কোনো সুযোগই নেই।
              </p>
            </div>

            {/* feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-lg transition-all duration-300">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-extrabold text-xl mb-4">
                🧤
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-sans">হাতের কব্জিতে রাবার গ্রিপ</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                কব্জিতে প্রিমিয়াম ফিনিশড রাবার দেওয়া রয়েছে। মোটরসাইকেল ড্রাইভ বা সাইক্লিং করার সময় হাত বেয়ে বাতাস ও জল কাপড়ের ভেতর প্রবেশ করতে পারে না।
              </p>
            </div>

            {/* feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-lg transition-all duration-300">
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-extrabold text-xl mb-4">
                🏍️
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-sans">বাইকার ও সাইক্লিস্টদের পরম গিয়ার</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                TVS, Suzuki, Yamaha, Pulsar বা Bajaj ইত্যাদি বাইক নিয়ে যারা হাইওয়েতে নিয়মিত যাতায়াত করেন, তাদের বর্ষাকালের একমাত্র নিখুঁত ভরসা আমাদের এই প্রিমিয়াম রেনকোট।
              </p>
            </div>

            {/* feature 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-lg transition-all duration-300">
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-extrabold text-xl mb-4">
                📦
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-sans">অগ্রিম টাকা ছাড়াই ডেলিভারি</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                বিশ্বাসযোগ্যতায় আমরা বিশ্বাসী! অর্ডার করতে অগ্রিম এক টাকাও দিতে হবে না। পার্সেল হাতে পেয়ে কোয়ালিটি দেখে তারপর কুরিয়ার এজেন্ট বা ডেলিভারি বয়কে মূল্য পরিশোধ করুন।
              </p>
            </div>

            {/* feature 6 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-lg transition-all duration-300">
              <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 font-extrabold text-xl mb-4">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-sans">সিঙ্গেল পার্ট - ৩ বছর ব্যবহারের গ্যারান্টি</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                হালকা এবং সহজে বহনযোগ্য হওয়ার সাথে এই রেনকোটটি অত্যন্ত টেকসই। একটানা ৩ বছর অনায়াসে ব্যবহার করতে পারবেন, রঙ বা ইলাস্টিসিটি নষ্ট হবে না।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sizing Chart Tool Section */}
      <section className="py-16 bg-white" id="size-chart">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Info and size tips left side */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 uppercase tracking-widest font-sans">
                সাইজ গাইডলাইন
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight font-sans">
                সাইজ নিয়ে আর কোনো কনফিউশন নেই!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans">
                আমাদের প্রতিটি কোট স্ট্যান্ডার্ড ফিটিং মাপ অনুযায়ী সেলাই করা। তবুও সাইজের কোনো সংশয় কাটাতে ডানের ক্যালকুলেটরে আপনার ওজন এবং উচ্চতা সিলেক্ট করুন, সেরা মাপটি অটোমেটিক নির্বাচন হয়ে যাবে।
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-sans">
                  💡 সাধারণ কিছু সাইজ টিপস
                </h4>
                <ul className="space-y-3 text-slate-600 text-xs font-sans">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 bg-blue-105 text-blue-900 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">১</span>
                    <span>সাধারণত আপনি যে সাইজের শার্ট বা প্যান্ট পরিধান করেন রেনকোটে তার একই বা পরবর্তী বড় সাইজটি নেওয়া বুদ্ধিমানের কাজ।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 bg-blue-105 text-blue-900 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">২</span>
                    <span>ডাবল পার্টের কাপড়ে বুক বা পেট খুব বেশি ভারী মনে হলে সাইজ চার্ট দেখে এক ধাপ বড় সাইজ নির্বাচন করুন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 bg-blue-105 text-blue-900 rounded-full font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">৩</span>
                    <span>সরাসরি চ্যাটে আমাদের সাথে কথা বলতে আপনার উচ্চতা ও ওজন ইনবক্সে মেসেজ করুন, আমরা সঠিক সাইজ গাইড করব।</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Interactive Sizing Component right side */}
            <div className="lg:col-span-8">
              <SizingChart onSelectSize={setSelectedSize} selectedSize={selectedSize} />
            </div>

          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-slate-950 text-white" id="reviews">
        <div className="container mx-auto px-4 max-w-7xl">
          <ReviewsList />
        </div>
      </section>

      {/* Order Placement and Form flow section */}
      <section className="py-16 bg-blue-50/20" id="checkout-form">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="form-scroll-target">
            
            {/* Purchase assurances block left side */}
            <div className="lg:col-span-5 space-y-6">
              <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wider font-sans inline-block border border-orange-200">
                ১০০% ক্যাশ অন কুরিয়ার (COD)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight font-sans">
                অত্যন্ত সহজে অর্ডার করুন কোনো অগ্রিম টাকা পরিশোধ ছাড়াই!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans">
                ডেলিভারি বুক করতে বা রেইনকোটটি পেতে কোনো বিকাশ পার্সোনাল বা অফলাইন অ্যাকাউন্ট চার্য পাঠাতে হবে না। আমরা ১০০% নিরাপদ কুরিয়ার প্রকোষ্ঠে বিশ্বাসী।
              </p>

              {/* Step guidance milestones */}
              <div className="relative border-l border-blue-200 pl-6 ml-3 space-y-6 text-slate-700">
                <div className="relative">
                  <span className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shadow-md">১</span>
                  <h4 className="font-bold text-slate-900 text-sm font-sans">ফরম ফিলাপ করুন</h4>
                  <p className="text-slate-500 text-xs mt-1 font-sans">আপনার নাম, মোবাইল নাম্বার এবং ডেলিভারি জেলার নাম সঠিকভাবে লিখুন।</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shadow-md">২</span>
                  <h4 className="font-bold text-slate-900 text-sm font-sans">কনফার্মেশন কল রিসিভ করুন</h4>
                  <p className="text-slate-500 text-xs mt-1 font-sans">আমাদের কুরিয়ার অ্যাসোসিয়েট কল করে মাত্র ১ মিনিটে আপনার অর্ডারের সাইজ ও কালার পুনর্নিরীক্ষণ করবেন।</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shadow-md">৩</span>
                  <h4 className="font-bold text-slate-900 text-sm font-sans">ডেলিভারি ম্যানকে চেক করে পে করুন</h4>
                  <p className="text-slate-500 text-xs mt-1 font-sans">পার্সেল হাতে পাওয়ার পর রেইনকোট খুলে কোয়ালিটি পরখ করবেন, সব ঠিকঠাক থাকলে নগদ টাকা ক্যাশ পেমেন্ট করে চলে আসবেন!</p>
                </div>
              </div>

              {/* Bikers support quote */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-xs">
                <div className="bg-orange-500 text-white p-2.5 rounded-xl font-bold animate-pulse text-lg">
                  🏍️
                </div>
                <p className="text-xs leading-relaxed text-slate-500 font-sans">
                  <strong>বাইকারদের উদ্দেশ্যে স্পেশাল অফার:</strong> সুজুকি, ইয়ামাহা, পালসার বা টিভিএস বাইকার বন্ধুরা আমাদের রেনকোট কাপড়ে পেয়ে অত্যন্ত খুশি। কাদা বৃষ্টির চাট থেকে বাইক রাইড সেফ ও ড্রাই রাখতে আজই আপনার পছন্দের রঙ কনফার্ম করুন।
                </p>
              </div>
            </div>

            {/* Dynamic order form / Receipt output column */}
            <div className="lg:col-span-7">
              {submittedOrder ? (
                <Receipt order={submittedOrder} onClose={handleBackToShopping} />
              ) : (
                <OrderForm
                  initialSize={selectedSize}
                  selectedColor={selectedColor}
                  onChangeSize={setSelectedSize}
                  onChangeColor={setSelectedColor}
                  onOrderSuccess={handleOrderCreated}
                />
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Suttle Sticky bottom CTA order bar (for outstanding conversions) */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 py-3.5 px-4 shadow-[0_-5px_15px_rgba(0,0,0,0.06)] z-45 flex flex-col sm:flex-row justify-between items-center gap-3 block">
        <div className="flex items-center gap-2.5 text-slate-800 text-xs sm:text-sm font-sans font-semibold">
          <CloudRain className="h-5 w-5 text-orange-500 shrink-0" />
          <span>
            নির্বাচিত সাইজ: <span className="font-mono bg-slate-100 text-blue-900 px-1.5 py-0.5 rounded font-bold">{selectedSize}</span>, 
            কালার: <span className="text-blue-900 font-extrabold">{selectedColor === 'Black' ? 'কালো' : 'নেভি ব্লু'}</span>, 
            দাম: <span className="font-mono text-orange-600 font-extrabold">{selectedSize === '3XL' || selectedSize === '4XL' ? '১০৯০' : '৯৯০'} TK</span>
          </span>
        </div>
        <button
          onClick={() => scrollToSection('checkout-form')}
          className="w-full sm:w-auto px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition duration-300 shadow-md cursor-pointer flex items-center justify-center gap-1.5 font-sans"
          id="sticky-order-cta"
        >
          <ShoppingBag className="h-4 w-4" /> দ্রুত অর্ডার করুন (অগ্রিম টাকা ছাড়া)
        </button>
      </div>

      {/* Trust-building Footer and Admin shortcuts */}
      <footer className="bg-slate-900 text-white py-12 px-4 border-t border-slate-800 text-center relative z-25">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🌧️</span>
            <span className="text-lg font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-white">
              প্রিমিয়াম রেইনকোট বাংলাদেশ
            </span>
          </div>

          <p className="text-slate-400 text-xs max-w-xl mx-auto font-sans leading-relaxed">
            আমরা স্থানীয় বাইকার ও সাধারণ যাতায়াতকারীদের জন্য সর্বোচ্চ প্রিমিয়াম ওয়াটারপ্রুফ গিয়ার সরবরাহ করি। আমাদের হিট সিল টেকনোলজি ও কব্জি রাবার গ্রিপ ১০০% লিক সেফ। কোনো প্রিপেইড চার্জ ছাড়া পণ্য বুঝে পেয়ে মূল্য পরিশোধ করুন।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] sm:text-xs text-slate-500 font-mono">
            <span>© {new Date().getFullYear()} Raincoat BD. All rights reserved.</span>
            <span>•</span>
            <span>হিট সিল ইলাস্টিক জ্যাকেট ও প্যান্ট</span>
            <span>•</span>
            <button
              onClick={() => setShowAdmin(true)}
              className="text-slate-400 hover:text-yellow-400 transition underline cursor-pointer flex items-center gap-1 font-sans"
              id="admin-dashboard-toggle-footer"
            >
              <Settings className="h-3 w-3" /> অ্যাডমিন প্যানেল ({ordersCount} অর্ডার)
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Call & WhatsApp Buttons */}
      <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {/* WhatsApp Button */}
        <a
          href="https://wa.me/8801624933949"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-full shadow-[0_3px_10px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_15px_rgba(16,185,129,0.45)] transition-all duration-350 transform hover:scale-110"
          title="হোয়াটসঅ্যাপ মেসেজ"
        >
          <MessageCircle className="h-5 w-5" />
        </a>

        {/* Call Button */}
        <a
          href="tel:+8801624933949"
          className="pointer-events-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full shadow-[0_3px_10px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_15px_rgba(37,99,235,0.45)] transition-all duration-350 transform hover:scale-110"
          title="সরাসরি কল করুন"
        >
          <Phone className="h-4.5 w-4.5 animate-pulse" />
        </a>
      </div>

      {/* Admin Panel Modal Overlay */}
      {showAdmin && (
        <AdminPanel 
          onClose={() => setShowAdmin(false)} 
          onRefreshOrdersCount={refreshOrdersCount}
        />
      )}

    </div>
  );
}

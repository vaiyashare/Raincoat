import React from 'react';
import { CheckCircle, Truck, PackageCheck, ClipboardCheck, ArrowRight, ShoppingBag, PhoneCall, Sparkles } from 'lucide-react';
import { RaincoatOrder } from '../types';

interface ReceiptProps {
  order: RaincoatOrder;
  onClose: () => void;
}

export default function Receipt({ order, onClose }: ReceiptProps) {
  // Format creation date
  const orderDateStr = new Date(order.createdAt).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-3xl shadow-2xl border-4 border-blue-950 overflow-hidden max-w-lg mx-auto" id="order-receipt">
      {/* Decorative banner */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white text-center p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600"></div>
        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-400 mb-4 text-emerald-600 animate-bounce">
          <CheckCircle className="h-10 w-10 fill-current text-emerald-500" />
        </div>
        <span className="px-3 py-1 bg-white/20 text-white text-[11px] font-bold rounded-full uppercase tracking-wider font-sans">
          সফলভাবে অর্ডার সম্পূর্ণ হয়েছে!
        </span>
        <h2 className="text-2xl sm:text-3xl font-black font-sans mt-3 text-white">
          ধন্যবাদ, অর্ডার বুকড!
        </h2>
        <p className="text-blue-100 text-xs sm:text-sm mt-1.5 font-sans leading-relaxed">
          আপনার অর্ডারটি আমাদের সিস্টেমে সফলভাবে সংরক্ষিত করা হয়েছে। অত্যন্ত দ্রুত গতিতে আমাদের প্যাকেজিং টিম পণ্যটি কুরিয়ারে হস্তান্তর করবে।
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Order detail grid */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 text-xs sm:text-sm space-y-2.5">
          <div className="flex justify-between items-center text-slate-400 text-[10px] sm:text-xs">
            <span className="uppercase font-mono font-bold">অর্ডার আইডি: {order.id}</span>
            <span className="font-sans">{orderDateStr}</span>
          </div>
          <div className="h-px bg-slate-200/60 my-1" />
          <div className="flex justify-between font-sans">
            <span className="text-slate-500 font-semibold">গ্রাহকের নাম:</span>
            <span className="font-bold text-slate-800">{order.name}</span>
          </div>
          <div className="flex justify-between font-sans">
            <span className="text-slate-500 font-semibold">মোবাইল নাম্বার:</span>
            <span className="font-mono text-slate-800 font-bold">{order.phone}</span>
          </div>
          <div className="flex justify-between font-sans">
            <span className="text-slate-500 font-semibold">ডেলিভারি ঠিকানা:</span>
            <span className="text-slate-800 text-right font-medium max-w-[60%]">
              {[order.village, order.policeStation, order.district].filter(Boolean).join(', ')}
            </span>
          </div>
          <div className="flex justify-between font-sans">
            <span className="text-slate-500 font-semibold">নির্বাচিত সাইজ ও কালার:</span>
            <span className="text-slate-800 font-bold flex items-center gap-1.5">
              <span className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-xs">{order.size}</span>
              <span className="text-xs">({order.color === 'Black' ? 'কালো' : 'নেভি ব্লু'})</span>
            </span>
          </div>
          <div className="flex justify-between font-sans">
            <span className="text-slate-500 font-semibold">ওজন ও উচ্চতা:</span>
            <span className="text-slate-800 font-medium">
              {order.weight} কেজি, {order.heightFeet}’{order.heightInches}”
            </span>
          </div>
          <div className="h-px bg-slate-200/60 my-1" />
          <div className="flex justify-between font-sans items-center text-blue-950">
            <span className="text-xs font-bold text-slate-700">পরিশোধযোগ্য সর্বমোট মূল্য:</span>
            <span className="text-xl font-mono font-extrabold text-blue-800">{order.price} TK (ক্যাশ অন ডেলিভারি)</span>
          </div>
        </div>

        {/* Live shipment simulation banner */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1 font-sans">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> লাইভ শিপমেন্ট ট্র্যাকিং সিমুলেটর
          </h4>
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Base line */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 -z-10"></div>
            {/* Active filled line */}
            <div className="absolute top-5 left-8 right-1/2 h-1 bg-gradient-to-r from-blue-600 to-orange-500 -z-10 transition-all duration-700"></div>

            {[
              { label: 'অর্ডার গৃহীত', icon: ClipboardCheck, color: 'text-blue-600 bg-blue-50 border-blue-300' },
              { label: 'প্যাকিং চলতেছে', icon: PackageCheck, color: 'text-orange-500 bg-orange-50 border-orange-300' },
              { label: 'কুরিয়ারে পথে', icon: Truck, color: 'text-slate-400 bg-slate-50 border-slate-200 animate-pulse' },
              { label: 'হাতে পেয়ে পেমেন্ট', icon: ShoppingBag, color: 'text-slate-300 bg-slate-50 border-slate-100' }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center p-2 shadow-sm ${step.color} bg-white relative z-10`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[9px] font-sans font-bold text-slate-600 mt-2.5 leading-tight">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* What next instructions */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-[11px] sm:text-xs leading-relaxed text-slate-700 font-sans space-y-1.5">
          <p className="font-bold text-blue-900">পরবর্তী ধাপসমূহ (What Next?):</p>
          <ul className="list-decimal pl-4 space-y-1 text-slate-600">
            <li>পরবর্তী ১২ ঘণ্টার মধ্যে আমাদের কাস্টমার সার্ভিসের একজন রিপ্রেজেন্টেটিভ আপনার মোবাইল নাম্বারে কল করে ঠিকানা কনফার্ম করবেন।</li>
            <li>কনফার্মেশনের মাত্র ৩ দিনের মধ্যে ডেলিভারি ম্যান আপনার বাড়িতে রেইনকোটটি পৌঁছে দেবে।</li>
            <li>পণ্যটি ট্রাই করে সম্পূর্ণ সন্তুষ্ট হলে তবেই টাকা পরিশোধ করুন।</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl transition duration-300 shadow-md text-center hover:shadow-orange-500/10 hover:shadow-lg font-sans flex items-center justify-center gap-1 cursor-pointer"
            id="order-more-button"
          >
            <ShoppingBag className="h-4 w-4" /> আরেকটি অর্ডার করুন <ArrowRight className="h-4 w-4 ml-1" />
          </button>
          
          <a
            href="tel:+8801750547800"
            className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-sm rounded-xl transition duration-300 text-center font-sans flex items-center justify-center gap-1.5"
          >
            <PhoneCall className="h-4 w-4" /> সরাসরি কল করুন
          </a>
        </div>
      </div>
    </div>
  );
}

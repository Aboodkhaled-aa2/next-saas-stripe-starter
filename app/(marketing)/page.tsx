import React from 'react';
import Link from 'next/link';
import { 
  Bot, PhoneCall, Calendar, MessageSquare, Shield, Zap, CheckCircle2, 
  ArrowRight, Sparkles, Clock, DollarSign, Star, Users, BarChart3, 
  HelpCircle, ChevronDown, Lock, RefreshCw, Check, Smartphone, Building2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Smart Cleaning <span className="text-emerald-400">Desk</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition">المميزات</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">كيف يعمل</a>
            <a href="#demo" className="hover:text-emerald-400 transition">محاكاة حية</a>
            <a href="#pricing" className="hover:text-emerald-400 transition">الأسعار</a>
            <a href="#faq" className="hover:text-emerald-400 transition">الأسئلة الشائعة</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">تسجيل الدخول</Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" /> نظام التشغيل بالذكاء الاصطناعي لشركات التنظيف
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            ضاعف حجوزات شركة التنظيف وأتمت عملياتك <span className="text-emerald-400">بدون تدخل بشري</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            منصة متكاملة تجمع الواتساب، المكالمات، حجز المواعيد، وجدولة طاقم العمل في نظام ذكي واحد يعمل على مدار الساعة لخدمة عملائك.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition">
              ابدأ تجربتك المجانية الآن <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#demo" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base border border-slate-800 flex items-center justify-center gap-2 transition">
              شاهد العرض التوضيحي
            </a>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl backdrop-blur max-w-4xl mx-auto text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-slate-400 mr-2 font-mono">SmartCleaningDesk AI Inbox - Live</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">متصل 24/7</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">عميل</div>
                <div>
                  <p className="text-slate-200">مرحباً، أريد حجز خدمة تنظيف عميق لشقة 3 غرف في حي الملقا غداً الساعة 10 صباحاً؟</p>
                  <span className="text-[10px] text-slate-500">عبر واتساب - قبل دقيقة</span>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20 mr-6">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">AI</div>
                <div>
                  <p className="text-emerald-200">أهلاً بك! تم التحقق من جدول الفريق المتاح. الموعد غداً 10:00 صباحاً متاح تماماً. السعر الإجمالي 350 ريال شامل المواد. هل أثبت الحجز وأرسل لك رابط الدفع الآمن؟</p>
                  <span className="text-[10px] text-emerald-400/70">رد تلقائي ذكي - الآن</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">لماذا تفقد شركات التنظيف ما يصل إلى 40% من عملائها؟</h2>
            <p className="text-slate-400">الطرق التقليدية في إدارة المكالمات والواتساب تسبب خسائر فادحة يومياً.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6 font-bold text-xl">01</div>
              <h3 className="text-xl font-bold text-white mb-3">تأخر الرد على العملاء</h3>
              <p className="text-slate-400 text-sm leading-relaxed">العميل الذي لا يجد رداً فورياً خلال دقائق ينتقل فوراً إلى شركة منافسة.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6 font-bold text-xl">02</div>
              <h3 className="text-xl font-bold text-white mb-3">فوضى جداول العمالة</h3>
              <p className="text-slate-400 text-sm leading-relaxed">تداخل المواعيد وضياع تفاصيل مهام التنظيف يترتب عليه شكاوى مستمرة.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-6 font-bold text-xl">03</div>
              <h3 className="text-xl font-bold text-white mb-3">متابعة المدفوعات الصعبة</h3>
              <p className="text-slate-400 text-sm leading-relaxed">صعوبة تحصيل الأموال وإرسال الفواتير يدوياً يستنزف وقت الإدارة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">كيف يعمل Smart Cleaning Desk؟</h2>
            <p className="text-slate-400">ثلاث خطوات بسيطة لتحويل عمليات شركتك إلى نظام آلي بالكامل.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 relative">
              <span className="absolute top-4 left-4 text-4xl font-black text-slate-800">1</span>
              <h3 className="text-xl font-bold text-white mb-3 pt-4">اربط قنواتك</h3>
              <p className="text-slate-400 text-sm leading-relaxed">اربط رقم واتساب الخاص بشركتك، حسابات التواصل، ورقم الهاتف المخصص بضغطة زر واحدة.</p>
            </div>
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 relative">
              <span className="absolute top-4 left-4 text-4xl font-black text-slate-800">2</span>
              <h3 className="text-xl font-bold text-white mb-3 pt-4">حدد أسعارك وجدولك</h3>
              <p className="text-slate-400 text-sm leading-relaxed">أدخل أنواع الخدمات (تنظيف منازل، أثاث، مكاتب) وأوقات عمل فرق العمل المتاحة لديك.</p>
            </div>
            <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 relative">
              <span className="absolute top-4 left-4 text-4xl font-black text-slate-800">3</span>
              <h3 className="text-xl font-bold text-white mb-3 pt-4">دع الذكاء الاصطناعي يعمل</h3>
              <p className="text-slate-400 text-sm leading-relaxed">سيبدأ الوكلاء الذكيون بالرد على العملاء، حجز المواعيد، وتحصيل المدفوعات آلياً.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI Features Grid */}
      <section id="features" className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">خصائص ذكية صُممت خصيصاً لقطاع التنظيف</h2>
            <p className="text-slate-400">أدوات متطورة تضع شركتك في المقدمة الرقمية.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">مساعد ذكي للدردشة</h3>
                <p className="text-slate-400 text-sm">ردود فورية تفهم تفاصيل مساحات الغرف وأنواع التنظيف بدقة متناهية.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">مستقبل مكالمات صوتي</h3>
                <p className="text-slate-400 text-sm">يجيب على المكالمات الهاتفية الفائتة ويرد بصوت طبيعي كأنه موظف استقبال محترف.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">جدولة تلقائية للفرق</h3>
                <p className="text-slate-400 text-sm">توزيع المهام على فرق التنظيف حسب المنطقة الجغرافية وجداول المواعيد.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">إدارة المراجعات والتقييمات</h3>
                <p className="text-slate-400 text-sm">إرسال روابط تقييم تلقائية للعملاء بعد انتهاء الخدمة لرفع سمعة شركتك.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">ربط بوابات الدفع</h3>
                <p className="text-slate-400 text-sm">تكامل كامل مع Stripe وفواتير الدفع الإلكتروني لتأكيد الحجوزات مالياً.</p>
              </div>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">لوحة تحكم وتقارير</h3>
                <p className="text-slate-400 text-sm">متابعة إيرادات الشركة، نسبة إنجاز المهام، وأداء الفرق لحظة بلحظة.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Channels */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">تواصل مع عملائك عبر كل القنوات المفضلة لديهم</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16">نظام موحد يجمع كافة رسائل ومكالمات العملاء في مكان واحد.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <MessageSquare className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">واتساب الأعمال</h3>
              <p className="text-xs text-slate-400 mt-1">رد آلي على مدار الساعة</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <PhoneCall className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">المكالمات الهاتفية</h3>
              <p className="text-xs text-slate-400 mt-1">استقبال وحجز صوتي</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <Smartphone className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">إنستغرام وفيس بوك</h3>
              <p className="text-xs text-slate-400 mt-1">الرد على الرسائل والتعليقات</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <Building2 className="w-10 h-10 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white">موقعك الإلكتروني</h3>
              <p className="text-xs text-slate-400 mt-1">منصة حجز تفاعلية مباشرة</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Before / After */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">الفرق الشاسع قبل وبعد Smart Cleaning Desk</h2>
            <p className="text-slate-400">انتقل بشركتك من الفوضى التشغيلية إلى أعلى مستويات الاحترافية.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-950/20 border border-red-500/30 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">❌ بدون المنصة (الطريقة التقليدية)</h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start gap-3">ضياع العملاء بسبب تأخر الرد في أوقات الذروة.</li>
                <li className="flex items-start gap-3">مجهود شاق ويومي في تنسيق جداول المواعيد والفرق.</li>
                <li className="flex items-start gap-3">تأخر تحصيل المبالغ النقدية ومشاكل الفواتير الورقية.</li>
                <li className="flex items-start gap-3">صعوبة متابعة جودة أداء العمالة في المواقع.</li>
              </ul>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-8 rounded-2xl">
              <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">✅ مع Smart Cleaning Desk</h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start gap-3">رد فوري وحجز تلقائي للعملاء خلال ثوانٍ معدودة.</li>
                <li className="flex items-start gap-3">جدولة ذكية وموزعة على الفرق جغرافياً بلا أخطاء.</li>
                <li className="flex items-start gap-3">دفع إلكتروني مسبق وموثوق يحمي إيراداتك مالياً.</li>
                <li className="flex items-start gap-3">تقارير أداء ومراجعات عملاء آلية ترفع اسم شركتك.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">باقات أسعار شفافة تناسب حجم شركتك</h2>
            <p className="text-slate-400">اختر الباقة المناسبة وابدأ في أتمتة عملياتك اليوم.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">البداية</span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">Starter</h3>
                <p className="text-slate-400 text-sm mb-6">مناسبة لشركات التنظيف الناشئة.</p>
                <div className="text-4xl font-black text-white mb-6">$49<span className="text-sm font-normal text-slate-400">/شهرياً</span></div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> رد آلي عبر واتساب</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> جدول مواعيد أساسي</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> حتى 300 حجز شهرياً</li>
                </ul>
              </div>
              <Link href="/signup" className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center transition">اختر Starter</Link>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border-2 border-emerald-500 flex flex-col justify-between relative shadow-xl shadow-emerald-500/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-full">الأكثر طلباً</span>
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">الاحترافية</span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">Business</h3>
                <p className="text-slate-400 text-sm mb-6">للشركات المتوسطة والنمو السريع.</p>
                <div className="text-4xl font-black text-white mb-6">$99<span className="text-sm font-normal text-slate-400">/شهرياً</span></div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> واتساب + قنوات التواصل</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> تكامل بوابات الدفع Stripe</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> حجوزات غير محدودة</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> إدارة العمالة والفرق</li>
                </ul>
              </div>
              <Link href="/signup" className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-center transition">اختر Business</Link>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">المتقدمة</span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">Pro</h3>
                <p className="text-slate-400 text-sm mb-6">للكيانات الكبرى ووكلاء الصوت.</p>
                <div className="text-4xl font-black text-white mb-6">$199<span className="text-sm font-normal text-slate-400">/شهرياً</span></div>
                <ul className="space-y-3 text-sm text-slate-300 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> رقم هاتف مخصص للمكالمات</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> وكيل صوتي ذكي بالكامل</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> دعم فني مخصص VIP</li>
                </ul>
              </div>
              <Link href="/signup" className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-center transition">اختر Pro</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Cleaning Business Types */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">مناسب لكافة تخصصات قطاع التنظيف</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-16">مهما كان حجم أو طبيعة خدماتك، النظام مهيأ لخدمتك بدقة.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">تنظيف المنازل والفلل</h3>
              <p className="text-xs text-slate-400">حجز وتنظيم زيارات الدوريات السكنية</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">التنظيف التجاري والمكتبي</h3>
              <p className="text-xs text-slate-400">عقود الشركات والمؤسسات الدورية</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">شقق الإيجار القصير (Airbnb)</h3>
              <p className="text-xs text-slate-400">تنظيف سريع بين فترات تسليم الضيوف</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">تنظيف الأثاث والسجاد</h3>
              <p className="text-xs text-slate-400">حجز حسب حجم القطع وعددها</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">الأسئلة الشائعة</h2>
            <p className="text-slate-400">كل ما تحتاج لمعرفته حول تشغيل النظام.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">هل أحتاج لخبرة تقنية لربط النظام؟</h3>
              <p className="text-slate-400 text-sm">أبداً، الربط يتم بخطوات سهلة وبسيطة، وفريق الدعم الفني جاهز لمساعدتك لحظة بلحظة.</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">كيف يتعامل الذكاء الاصطناعي مع أسعار الخدمات المختلفة؟</h3>
              <p className="text-slate-400 text-sm">تقوم بإدخال جدول أسعارك مرة واحدة، وسيقوم النظام بحساب تكلفة الخدمات بدقة وإبلاغ العميل بها.</p>
            </div>
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-white mb-2">هل يمكنني تجربة المنصة قبل الاشتراكات الشهرية؟</h3>
              <p className="text-slate-400 text-sm">نعم، نوفر لك فترة تجريبية مجانية بالكامل لتقييم أداء النظام على شركتك.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Dedicated Phone Number Section */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">باقة Pro المتقدمة</span>
            <h2 className="text-3xl font-bold text-white mt-4 mb-4">رقم هاتف مخصص لشركتك مدعوم بالذكاء الاصطناعي الصوتي</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              امنح شركتك هيبة الشركات الكبرى برقم هاتف خاص يجيب على المكالمات فوراً، يتفاوض على المواعيد، ويثبت الحجوزات دون أن تفقد أي عميل هاتفي مجدداً.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> متوافق مع اللهجات المحلية بطلاقة</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> تحويل المكالمات الصعبة للمشرف البشري عند الحاجة</li>
            </ul>
          </div>
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center">
            <PhoneCall className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <div className="text-xl font-bold text-white mb-2">+966 11 000 0000</div>
            <p className="text-xs text-slate-400">جاهز لاستقبال مكالمات عملائك على مدار الساعة</p>
          </div>
        </div>
      </section>

      {/* 12. Pricing Comparison Table */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">جدول مقارنة تفصيلي للباقات</h2>
            <p className="text-slate-400">قارن الميزات واختر ما يناسب طموح عملك.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-sm">
                  <th className="py-4 px-4 font-semibold">الميزة</th>
                  <th className="py-4 px-4 font-semibold text-center">Starter</th>
                  <th className="py-4 px-4 font-semibold text-center text-emerald-400">Business</th>
                  <th className="py-4 px-4 font-semibold text-center">Pro</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300 divide-y divide-slate-800/60">
                <tr>
                  <td className="py-4 px-4 font-medium text-white">الرد الآلي عبر واتساب</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">بوابات الدفع الإلكتروني</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-white">رقم هاتف صوتي مخصص</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center text-slate-600">-</td>
                  <td className="py-4 px-4 text-center"><Check className="w-5 h-5 text-emerald-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 13. Value / ROI Section */}
      <section className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <Clock className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <div className="text-4xl font-black text-white mb-2">15+ ساعة</div>
            <p className="text-slate-400 text-sm">توفير أسبوعي من وقت الإدارة في الرد والتنسيق اليدوي.</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <DollarSign className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <div className="text-4xl font-black text-white mb-2">35%</div>
            <p className="text-slate-400 text-sm">زيادة فورية في إيرادات الحجوزات المؤكدة بفضل سرعة الرد.</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <Star className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <div className="text-4xl font-black text-white mb-2">100%</div>
            <p className="text-slate-400 text-sm">دقة في المواعيد ومنع تداخل جداول فرق التنظيف.</p>
          </div>
        </div>
      </section>

      {/* 14. AI Conversation Demo */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">محاكاة حية لطريقة تفاعل الذكاء الاصطناعي</h2>
            <p className="text-slate-400">شاهد كيف يرد النظام على العميل بثقة واحترافية.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl">
              <span className="font-bold text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">العميل</span>
              <p className="text-slate-200 text-sm">كم سعر تنظيف فيلا من 5 غرف مع تعقيم المطبخ؟</p>
            </div>
            <div className="flex items-start gap-3 bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/20">
              <span className="font-bold text-xs bg-emerald-500 text-slate-950 px-2 py-1 rounded">الذكاء الاصطناعي</span>
              <p className="text-emerald-200 text-sm">أهلاً بك! سعر تنظيف الفيلا شامل التعقيم ومواد التنظيف الخاصة هو 650 ريال. يتطلب العمل فريق من 3 عمال لمدة 4 ساعات. هل أحجز لك موعداً لصباح السبت القادم؟</p>
            </div>
          </div>
        </div>
      </section>

      {/* 15. Trust & Security Badge Section */}
      <section className="py-16 px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-right">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">أمان تام وحماية لبيانات العملاء والمواعيد</h3>
              <p className="text-slate-400 text-sm">تشفير كامل لكافة بيانات الحجوزات والمعاملات المالية وفق أعلى المعايير.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400 font-semibold">
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-400" /> SSL Secured</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> GDPR Compliant</span>
          </div>
        </div>
      </section>

      {/* 16. Integrations & Ecosystem */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">يتكامل بسلاسة مع أدواتك الحالية</h2>
          <p className="text-slate-400 mb-12">اربط المنصة بالتقويمات وأنظمة الدفع التي تفضلها.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Google Calendar</div>
            <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Stripe Payments</div>
            <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">WhatsApp Business API</div>
            <div className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Meta Webhooks</div>
          </div>
        </div>
      </section>

      {/* 17. Comprehensive Footer & Final CTA */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 p-10 rounded-3xl border border-emerald-500/20 text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">جاهز لمضاعفة أرباح شركة التنظيف الخاصة بك؟</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">ابدأ الآن ولا تدع أي عميل يفوتك بسبب تأخر الرد أو فوضى الجداول.</p>
            <Link href="/signup" className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold inline-flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition">
              ابدأ تجربتك المجانية اليوم <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">Smart Cleaning Desk</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">منصة الأتمتة بالذكاء الاصطناعي الأولى المخصصة لشركات التنظيف.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">الروابط السريعة</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-emerald-400 transition">المميزات</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition">كيف يعمل</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition">الأسعار</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">الدعم والمساعدة</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#faq" className="hover:text-emerald-400 transition">الأسئلة الشائعة</a></li>
                <li className="hover:text-emerald-400 transition cursor-pointer">مركز المساعدة</li>
                <li className="hover:text-emerald-400 transition cursor-pointer">تواصل معنا</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">السياسات والقانونية</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-emerald-400 transition cursor-pointer">سياسة الخصوصية</li>
                <li className="hover:text-emerald-400 transition cursor-pointer">شروط الاستخدام</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <p>© 2026 Smart Cleaning Desk. جميع الحقوق محفوظة.</p>
            <p className="mt-4 md:mt-0">مصنوع خصيصاً لتمكين شركات التنظيف من النمو الذكي.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

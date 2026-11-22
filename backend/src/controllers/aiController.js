exports.diagnoseProblem = async (req, res) => {
  try {
    const rawText = String(req.body.problemText || '');
    const text = rawText.toLowerCase().trim();

    if (!text) {
      return res.json({
        prediction: 'সমস্যার অপশন সিলেক্ট করা হয়নি',
        priority: 'LOW',
        solution:
          '১. ONU বা রাউটারের বাতিগুলো কী অবস্থায় আছে তা সিলেক্ট করুন।\n' +
          '২. ইন্টারনেটে কী সমস্যা হচ্ছে তা সিলেক্ট করে "AI Predict & Solve" বাটনে চাপুন।'
      });
    }

    const diagnoses = [];

    // ১. LAN / Ethernet বাতি জ্বলছে না বা কেবল/পোর্ট সমস্যা
    if (
      text.includes('lan_off') ||
      text.includes('ethernet') ||
      text.includes('lan') ||
      text.includes('ল্যান') ||
      text.includes('কেবল') ||
      text.includes('cable') ||
      text.includes('পোর্ট') ||
      text.includes('port')
    ) {
      diagnoses.push({
        title: 'LAN পোর্টে লুজ কানেকশন বা ইথারনেট কেবল নষ্ট হওয়ার সমস্যা',
        priority: 'MEDIUM',
        steps:
          '১. ONU বা রাউটারের LAN পোর্টে লাগানো কেবলটি ঢিলা (loose) আছে কি না বা RJ45 কানেক্টরের ক্লিপ ভেঙে গেছে কি না চেক করে শক্ত করে লাগান।\n' +
          '২. কেবলটি অন্য একটি খালি LAN পোর্টে লাগিয়ে দেখুন বাতি জ্বলে কি না—তাতে পোর্টের সমস্যা থাকলে ধরা পড়বে।\n' +
          '৩. কেবলটি ক্ষতিগ্রস্ত বা পুরনো হলে নতুন Cat5e/Cat6 কেবল দিয়ে বদলে চেক করুন; সমাধান না হলে Complain Ticket পাঠান।'
      });
    }

    // ২. LOS লাল বাতি বা PON বাতি একেবারে বন্ধ
    if (
      text.includes('los_steady') ||
      text.includes('los_blink') ||
      text.includes('los') ||
      text.includes('red light') ||
      text.includes('লাল') ||
      text.includes('signal loss') ||
      text.includes('pon_off') ||
      text.includes('pon light off')
    ) {
      diagnoses.push({
        title: 'ফাইবার সিগন্যাল লস (LOS লাল বাতি / ড্রপ কেবল বা স্প্লিটার সমস্যা)',
        priority: 'HIGH',
        steps:
          '১. ONU-এর সামনের ফাইবার কানেক্টরটি আলতো করে খুলে আবার সঠিকভাবে লাগান (লুজ কানেকশন বা ময়লার কারণে LOS লাল হতে পারে)।\n' +
          '২. ফাইবার তার কোথাও তীক্ষ্ণভাবে ভাঁজ হয়েছে কি না বা দরজা/জানালার নিচে চাপা পড়েছে কি না দেখে সোজা করুন।\n' +
          '৩. বাসার ভেতরের সংযোগ ঠিক থাকার পরও LOS লাল থাকলে বাইরের লাইন বা স্প্লিটারে সমস্যা হতে পারে—দ্রুত টিকেট পাঠান।'
      });
    }

    // ৩. PON বাতি ব্লিঙ্ক করছে
    if (text.includes('pon_blink') || (text.includes('pon') && text.includes('blink'))) {
      diagnoses.push({
        title: 'PON সিগন্যাল সিঙ্কিং বা OLT অথেনটিকেশন সমস্যা',
        priority: 'MEDIUM',
        steps:
          '১. ONU ডিভাইসটি OLT-এর সাথে যুক্ত হওয়ার চেষ্টা করছে—১ থেকে ২ মিনিট অপেক্ষা করুন।\n' +
          '২. ফাইবার কানেক্টর ঠিকমতো লাগানো আছে কি না চেক করুন।\n' +
          '৩. কিছুক্ষণ পরও PON বাতি স্থির সবুজ (Solid Green) না হলে টিকেট পাঠিয়ে টেকনিশিয়ানকে জানান।'
      });
    }

    // ৪. পাওয়ার বা কোনো বাতিই জ্বলছে না
    if (
      text.includes('power_off') ||
      text.includes('no power') ||
      text.includes('বাতি জ্বলছে না') ||
      text.includes('কোনো বাতি')
    ) {
      diagnoses.push({
        title: 'বিদ্যুৎ সকেট বা ONU পাওয়ার অ্যাডাপ্টার সমস্যার আশঙ্কা',
        priority: 'HIGH',
        steps:
          '১. যে সকেটে অ্যাডাপ্টার লাগানো আছে, অন্য কোনো চার্জার বা ডিভাইস লাগিয়ে দেখুন সকেটে বিদ্যুৎ আছে কি না।\n' +
          '২. পাওয়ার অ্যাডাপ্টারের পিন ও জ্যাক ঠিকমতো লাগানো আছে কি না চেক করুন।\n' +
          '৩. সকেট ও অ্যাডাপ্টার ঠিক থাকার পরও কোনো বাতি না জ্বললে ডিভাইস বা অ্যাডাপ্টার নষ্ট হতে পারে—টিকেট দিন।'
      });
    }

    // ৫. বাতি ঠিক আছে কিন্তু ইন্টারনেট চলছে না
    if (
      text.includes('lights_ok_no_net') ||
      text.includes('no internet') ||
      text.includes('ইন্টারনেট চলছে না')
    ) {
      diagnoses.push({
        title: 'বিল বকেয়া, PPPoE সেশন ড্রপ বা ISP লাইন ডাউন সমস্যা',
        priority: 'MEDIUM',
        steps:
          '১. ড্যাশবোর্ডে দেখুন চলতি মাসের বিল Paid আছে কি না এবং Expire Date শেষ হয়ে গেছে কি না।\n' +
          '২. বিল Paid থাকার পরও ইন্টারনেট না এলে PPPoE সেশন বা ISP প্রান্তে লাইন ডাউন থাকতে পারে।\n' +
          '৩. সমাধান না হলে Complain Ticket তৈরি করে টেকনিশিয়ানের কাছে পাঠান।'
      });
    }

    // ৬. Wi-Fi কানেক্ট হচ্ছে না বা বন্ধ
    if (
      text.includes('wifi_off') ||
      text.includes('wifi') ||
      text.includes('ওয়াই-ফাই') ||
      text.includes('not connecting') ||
      text.includes('কানেক্ট হচ্ছে না')
    ) {
      diagnoses.push({
        title: 'Wi-Fi সিগন্যাল, পাসওয়ার্ড বা রাউটার রেঞ্জ সমস্যা',
        priority: 'LOW',
        steps:
          '১. ফোন বা ল্যাপটপের Wi-Fi একবার অফ করে পুনরায় অন করুন এবং রাউটারের কাছাকাছি গিয়ে চেক করুন।\n' +
          '২. নেটওয়ার্কটি Forget করে সঠিক পাসওয়ার্ড দিয়ে আবার কানেক্ট করুন।\n' +
          '৩. সব বাতি ঠিক থাকলেও Wi-Fi না পাওয়া গেলে রাউটারের Wi-Fi সেটিংস বা হার্ডওয়্যার চেকের জন্য টিকেট দিন।'
      });
    }

    // ৭. স্পিড স্লো / বাফারিং / হাই Ping / বারবার ডিসকানেক্ট
    if (
      text.includes('slow') ||
      text.includes('buffering') ||
      text.includes('ping') ||
      text.includes('lag') ||
      text.includes('disconnect') ||
      text.includes('স্লো') ||
      text.includes('বাফারিং') ||
      text.includes('ডিসকানেক্ট')
    ) {
      diagnoses.push({
        title: 'ব্যান্ডউইথ চাপ, হাই Ping বা লাইন কোয়ালিটি সমস্যা',
        priority: 'MEDIUM',
        steps:
          '১. বাসার অন্য কোনো ডিভাইসে বড় ফাইল ডাউনলোড, HD/4K ভিডিও বা অটো-আপডেট চলছে কি না দেখুন।\n' +
          '২. ড্যাশবোর্ডে "Run Live Speed Test" চাপুন এবং লাইভ গ্রাফে ডাউনলোড স্পিড ও Ping যাচাই করুন।\n' +
          '৩. প্যাকেজের তুলনায় অনেক কম স্পিড বা বেশি Ping থাকলে কিংবা বারবার ডিসকানেক্ট হলে টিকেট পাঠান।'
      });
    }

    if (diagnoses.length === 0) {
      return res.json({
        prediction: 'নেটওয়ার্ক ও কানেকশন যাচাই প্রয়োজন',
        priority: 'LOW',
        solution:
          '১. ফাইবার কানেক্টর, LAN কেবল ও পাওয়ার অ্যাডাপ্টার ঠিকমতো লাগানো আছে কি না চেক করুন।\n' +
          '২. ড্যাশবোর্ডে বিল স্ট্যাটাস Paid আছে কি না দেখুন এবং "Run Live Speed Test" চালিয়ে স্পিড ও Ping যাচাই করুন।\n' +
          '৩. সমস্যা থাকলে Complain Ticket তৈরি করে টেকনিশিয়ানের কাছে পাঠান।'
      });
    }

    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const highestPriority = diagnoses.reduce(
      (best, curr) => (priorityOrder[curr.priority] > priorityOrder[best] ? curr.priority : best),
      'LOW'
    );

    const combinedPrediction = diagnoses.map((d) => d.title).join(' + ');
    const combinedSolution = diagnoses
      .map((d, idx) =>
        diagnoses.length > 1 ? `【সমস্যা ${idx + 1}: ${d.title}】\n${d.steps}` : d.steps
      )
      .join('\n\n');

    return res.json({
      prediction: combinedPrediction,
      priority: highestPriority,
      solution: combinedSolution
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI সমস্যা নির্ণয় করতে ব্যর্থ হয়েছে।' });
  }
};
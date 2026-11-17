const truths = [
["easy","fun","آخرین چیزی که باعث شد از ته دل بخندی چی بود؟"],
["easy","friends","اولین برداشتت از نفر سمت راستت چی بود؟"],
["easy","school","خاطره خنده‌دار مدرسه‌ات رو تعریف کن."],
["easy","fun","اگه یک روز نامرئی بشی، اولین کارت چیه؟"],
["easy","friends","کدوم ویژگی خودت رو بیشتر دوست داری؟"],
["easy","creative","اگه می‌تونستی یک استعداد رو فوری یاد بگیری، چی انتخاب می‌کردی؟"],
["easy","school","کدوم درس رو بیشتر از همه دوست داری؟ چرا؟"],
["easy","fun","عجیب‌ترین غذایی که امتحان کردی چی بوده؟"],
["easy","friends","با کدوم یکی از جمع دوست داری سفر بری؟"],
["easy","creative","اگه زندگی‌ات فیلم بود اسمش چی می‌شد؟"],
["easy","social","آخرین باری که به کسی کمک کردی کی بود؟"],
["easy","fun","کدوم عادت بامزه رو داری که بقیه نمی‌دونن؟"],
["easy","school","تا حالا سر کلاس خوابت برده؟ تعریف کن."],
["easy","friends","به نظرت خنده‌دارترین آدم این جمع کیه؟"],
["easy","creative","اگه یک حیوان خانگی عجیب داشتی چی انتخاب می‌کردی؟"],
["easy","fun","بدترین سوتی آشپزی‌ات چی بوده؟"],
["easy","social","دوست داری مردم چه چیزی رو بیشتر درباره‌ات بدونن؟"],
["easy","friends","کدوم آهنگ رو بلدی کامل بخونی؟"],
["easy","school","بهترین زنگ مدرسه از نظرت کدومه؟"],
["easy","creative","اگه می‌تونستی به گذشته پیام بدی، به خودت چی می‌گفتی؟"],
["medium","fun","خجالت‌آورترین چیزی که توی جمع گفتی چی بوده؟"],
["medium","friends","تا حالا به کسی حسودی کردی؟ بابت چی؟"],
["medium","school","تا حالا تکلیفی رو دقیقه آخر انجام دادی؟"],
["medium","social","چه چیزی سریع عصبانیت می‌کنه؟"],
["medium","friends","کدوم نفر جمع بهتر از چیزی که فکر می‌کنی تو رو می‌شناسه؟"],
["medium","creative","اگه مجبور باشی یک ماه بدون اینترنت زندگی کنی چه می‌کنی؟"],
["medium","fun","عجیب‌ترین جست‌وجویی که توی اینترنت کردی چی بوده؟"],
["medium","school","تا حالا نمره‌ای گرفتی که از گفتنش خجالت بکشی؟"],
["medium","friends","چه قولی دادی که هنوز انجامش ندادی؟"],
["medium","social","بزرگ‌ترین ترست درباره آینده چیه؟"],
["medium","fun","آخرین دروغ کوچیکی که گفتی چی بود؟"],
["medium","creative","اگه می‌تونستی قانون جدیدی برای دنیا بذاری چی بود؟"],
["medium","friends","از کدوم رفتار دوستات بیشتر ناراحت می‌شی؟"],
["medium","school","کدوم معلم بیشترین تأثیر رو روت گذاشته؟"],
["medium","social","چه چیزی رو سخت می‌تونی به زبون بیاری؟"],
["medium","fun","تا حالا پیام اشتباهی برای کسی فرستادی؟ چی شد؟"],
["medium","friends","اگه قرار باشه با یک نفر از جمع هم‌تیمی بشی، کی رو انتخاب می‌کنی؟"],
["medium","creative","اگه فردا مشهور بشی، دوست داری به چه دلیل باشه؟"],
["medium","social","کدوم ویژگی رو باید در خودت بهتر کنی؟"],
["medium","fun","بدترین بهانه‌ای که برای دیر رسیدن آوردی چی بوده؟"],
["bold","friends","یک چیزی که مدت‌هاست می‌خوای به یکی از دوستانت بگی چیه؟"],
["bold","social","بزرگ‌ترین اشتباهی که ازش درس گرفتی چی بوده؟"],
["bold","friends","تا حالا از کسی عذرخواهی نکردی ولی می‌دونستی حق با اون بوده؟"],
["bold","fun","عجیب‌ترین فکری که قبل خواب به ذهنت می‌رسه چیه؟"],
["bold","school","اگه می‌تونستی یک اتفاق مدرسه رو تغییر بدی، کدوم بود؟"],
["bold","social","از چه چیزی بیشتر از قضاوت دیگران می‌ترسی؟"],
["bold","friends","کدوم ویژگی یکی از افراد جمع رو تحسین می‌کنی؟"],
["bold","creative","اگه هیچ‌کس قضاوتت نمی‌کرد چه کاری انجام می‌دادی؟"],
["bold","social","آخرین باری که واقعاً به خودت افتخار کردی کی بود؟"],
["bold","fun","یک راز بی‌ضرر و بامزه درباره خودت بگو."],
["bold","friends","چه چیزی باعث می‌شه اعتماد تو به یک نفر کم بشه؟"],
["bold","social","کدوم تصمیم زندگیت رو دوباره بررسی می‌کنی؟"],
["bold","creative","اگه فقط سه آرزو داشتی، چی می‌خواستی؟"],
["bold","school","چه چیزی رو در مدرسه یاد نگرفتی ولی کاش یاد می‌گرفتی؟"],
["bold","friends","تا حالا کسی رو اشتباه قضاوت کردی؟"],
["bold","social","چه عادتی رو دوست داری برای همیشه کنار بذاری؟"],
["bold","fun","کدوم لحظه زندگی‌ات رو دوست داری دوباره تجربه کنی؟"],
["bold","friends","اگه باید از یکی از جمع بابت چیزی تشکر کنی، کی و بابت چی؟"],
["bold","social","مهم‌ترین چیزی که امسال یاد گرفتی چی بوده؟"],
["bold","creative","اگه می‌تونستی جواب یک سؤال درباره آینده رو بدونی، چی می‌پرسیدی؟"],
["easy","fun","اگه فقط یک غذا رو تا یک هفته بخوری، چی انتخاب می‌کنی؟"],
["easy","friends","کدوم بازی رو از همه بهتر بلدی؟"],
["easy","creative","رنگی که بیشتر شبیه شخصیتته چیه؟"],
["easy","social","چه چیزی حالتو سریع خوب می‌کنه؟"],
["easy","school","بهترین اتفاقی که امسال توی مدرسه افتاد چی بود؟"],
["medium","fun","تا حالا جلوی آینه با خودت حرف زدی؟ درباره چی؟"],
["medium","friends","کدوم نفر جمع احتمالاً زودتر معروف می‌شه؟"],
["medium","social","چه چیزی رو بیش از حد جدی می‌گیری؟"],
["medium","creative","اگه یک روز جای مدیر مدرسه بودی اولین تغییرت چی بود؟"],
["medium","fun","بدترین مدل مو یا لباس دوران گذشته‌ات چی بوده؟"],
["medium","friends","تا حالا از روی رودربایستی کاری کردی؟"],
["medium","social","چه مهارتی رو باید زودتر یاد می‌گرفتی؟"],
["bold","fun","یک سوتی تعریف کن که هنوز با یادآوریش خنده‌ات می‌گیره."],
["bold","friends","اگه می‌تونستی یک عادت یکی از دوستات رو تغییر بدی، چی بود؟"],
["bold","social","کدوم حقیقت درباره خودت رو دیر پذیرفتی؟"],
["bold","creative","اگه قرار بود یک کتاب درباره زندگیت بنویسی، عنوانش چی بود؟"],
["bold","friends","چه چیزی باعث می‌شه یک دوستی برات ارزشمند بشه؟"],
["bold","school","کدوم قانون مدرسه از نظرت بی‌معنیه؟ چرا؟"],
["medium","creative","اگه یک اختراع به اسم خودت ثبت می‌کردی، چی بود؟"],
["medium","social","وقتی ناراحتی ترجیح می‌دی تنها باشی یا با کسی حرف بزنی؟"],
["easy","fun","اگه می‌تونستی یک شخصیت کارتونی باشی، کدوم بودی؟"],
["easy","friends","کدوم نفر جمع بهترین داستان‌گوئه؟"],
["medium","school","تا حالا به خاطر خنده نتونستی جلوی خودت رو بگیری؟"],
["bold","social","یک هدفی که هنوز جرئت شروعش رو پیدا نکردی چیه؟"],
["medium","friends","از چه چیزی در دوستی بیشتر از همه قدردانی می‌کنی؟"],
["easy","creative","اسم ابرقدرت خیالی خودت رو چی می‌ذاشتی؟"],
["bold","fun","اگه گوشی‌ات می‌تونست حرف بزنه، از چی شکایت می‌کرد؟"],
["medium","social","چه چیزی رو باید کمتر بهش اهمیت بدی؟"],
["easy","school","اگه یک زنگ اضافه در مدرسه بود دوست داشتی چه درسی باشه؟"],
["bold","friends","چه کسی در این جمع تو رو غافلگیر کرده؟"],
["medium","creative","اگه یک هفته در هر شهری زندگی می‌کردی کجا می‌رفتی؟"],
["easy","social","چه تعریف یا حرف خوبی رو هیچ‌وقت فراموش نمی‌کنی؟"],
["bold","school","کدوم خاطره مدرسه رو احتمالاً تا سال‌ها تعریف می‌کنی؟"],
["medium","fun","تا حالا برای فرار از کاری خودت رو مشغول نشون دادی؟"],
["easy","friends","اگه بخوای برای جمع یک اسم بذاری چی انتخاب می‌کنی؟"],
["bold","creative","اگه می‌تونستی یک روز با نسخه آینده خودت حرف بزنی چی می‌پرسیدی؟"],
["medium","social","کدوم ویژگی دیگران رو سریع تحسین می‌کنی؟"],
["easy","fun","یک ترکیب غذایی عجیب که دوست داری چیه؟"],
["bold","friends","کدوم خاطره مشترک با یکی از افراد جمع برات مهمه؟"],
["medium","school","اگه امتحان فردا لغو بشه اولین کارت چیه؟"],
["bold","social","چه چیزی رو در مورد خودت می‌خوای شجاعانه‌تر بیان کنی؟"],
["easy","creative","اگه یک سیاره جدید کشف کنی اسمش رو چی می‌ذاری؟"],
["medium","fun","کدوم ایموجی بیشتر از همه استفاده می‌کنی و چرا؟"],
["bold","friends","چه چیزی باعث شده به یکی از دوستات اعتماد کنی؟"],
["easy","social","بهترین توصیه‌ای که تا حالا شنیدی چی بوده؟"],
["medium","creative","اگه می‌تونستی یک قانون طبیعت رو عوض کنی چی بود؟"]
];
const dares = [
["easy","fun","با صدای گوینده اخبار، وضعیت همین اتاق رو گزارش کن."],
["easy","friends","از نفر سمت راستت یک تعریف واقعی و محترمانه بکن."],
["easy","creative","یک حیوان رو بدون صدا دربیار تا بقیه حدس بزنن."],
["easy","fun","۲۰ ثانیه مثل ربات راه برو."],
["easy","school","یک خاطره مدرسه رو مثل مجری مسابقه تعریف کن."],
["easy","fun","اسم سه میوه رو با سرعت و بدون اشتباه بگو."],
["easy","friends","برای نفر روبه‌روت یک لقب بامزه و محترمانه بساز."],
["easy","creative","با سه کلمه‌ای که جمع می‌گه یک داستان کوتاه بساز."],
["easy","fun","۱۰ ثانیه بدون خندیدن به سقف نگاه کن."],
["easy","social","از یکی از افراد جمع بابت یک کار خوبش تشکر کن."],
["easy","fun","یک آهنگ رو فقط با زمزمه اجرا کن."],
["easy","creative","در ۱۵ ثانیه یک لوگوی خیالی با انگشت توی هوا بکش."],
["easy","friends","یک خاطره خوب از جمع تعریف کن."],
["easy","fun","تا نوبت بعدی با لحن شخصیت کارتونی حرف بزن."],
["easy","school","یک درس رو مثل تبلیغ تلویزیونی معرفی کن."],
["easy","creative","یک اسم جدید برای این بازی اختراع کن."],
["easy","fun","بدون استفاده از دست‌ها یک شکلک خنده‌دار بساز."],
["easy","friends","یک ویژگی مثبت از هر دو نفر کنارت بگو."],
["easy","fun","مثل گزارشگر فوتبال، باز شدن یک در رو گزارش کن."],
["easy","creative","یک شعر دوخطی درباره یک وسیله داخل اتاق بساز."],
["medium","fun","۳۰ ثانیه با لهجه ساختگی صحبت کن."],
["medium","friends","از یکی از افراد جمع بخواه یک حرکت ساده بهت یاد بده و انجامش بده."],
["medium","creative","در ۲۰ ثانیه یک تبلیغ خلاقانه برای خودکار بساز."],
["medium","school","یک خاطره مدرسه رو در سه جمله و با هیجان تعریف کن."],
["medium","fun","یک دقیقه بدون گفتن کلمه «آره» به سؤال‌های جمع جواب بده."],
["medium","social","یک مهارت کوچک به جمع آموزش بده."],
["medium","fun","یک شخصیت معروف خیالی رو تقلید کن تا بقیه حدس بزنن."],
["medium","creative","با چشم باز یک نقاشی ساده در هوا توصیف کن تا بقیه بکشن."],
["medium","friends","برای نفر سمت چپت یک معرفی افتخاری ۱۵ ثانیه‌ای انجام بده."],
["medium","fun","یک جمله ساده رو سه بار با احساسات متفاوت بگو."],
["medium","school","یک قانون خنده‌دار برای مدرسه پیشنهاد بده و ازش دفاع کن."],
["medium","creative","یک داستان بساز که حتماً کلمات «گربه»، «فضا» و «پیتزا» توش باشه."],
["medium","fun","تا دور بعدی هر بار اسم خودت رو شنیدی یک بار دست بزن."],
["medium","friends","با اجازه جمع، یک عکس گروهی خلاقانه بگیرید."],
["medium","social","یک جمله انگیزشی واقعی برای نفر روبه‌روت بگو."],
["medium","fun","۱۵ ثانیه حرکت آهسته اجرا کن."],
["medium","creative","یک وسیله انتخاب کن و وانمود کن اختراع قرن رو ساختی."],
["medium","friends","یک خاطره بامزه از یکی از افراد جمع تعریف کن، بدون مسخره کردنش."],
["medium","fun","یک تکه از آهنگ مورد علاقه‌ات رو اجرا کن."],
["medium","school","یک معلم خیالی رو با احترام و بدون تقلید آزاردهنده معرفی کن."],
["bold","fun","یک دقیقه مجری برنامه استعدادیابی باش و یکی از افراد داوطلبانه شرکت کنه."],
["bold","creative","در ۳۰ ثانیه یک داستان ترسناک بی‌خطر تعریف کن."],
["bold","friends","از جمع بخواه یک موضوع بدن و همان لحظه یک سخنرانی کوتاه انجام بده."],
["bold","fun","تا ۳۰ ثانیه هر جمله‌ات رو با یک کلمه هم‌قافیه تموم کن."],
["bold","social","یک نقطه قوت خودت رو با اعتمادبه‌نفس جلوی جمع بیان کن."],
["bold","creative","یک رقص کوتاه و خنده‌دار بدون موسیقی اجرا کن."],
["bold","friends","برای کل جمع یک اسم تیمی و شعار بساز."],
["bold","fun","یک داستان عادی رو طوری تعریف کن انگار اتفاقی تاریخی بوده."],
["bold","school","یک موضوع درسی رو در ۲۰ ثانیه مثل استندآپ کمدی توضیح بده."],
["bold","creative","در ۳۰ ثانیه یک شخصیت خیالی با اسم و قدرت ویژه بساز."],
["bold","social","یک پیام مثبت کوتاه برای آینده خودت با صدای بلند بگو."],
["bold","fun","یک دقیقه نقش راهنمای موزه رو بازی کن و یک وسیله معمولی رو معرفی کن."],
["bold","friends","از هر نفر یک کلمه بگیر و با همه‌شون یک جمله بساز."],
["bold","creative","یک معمای ساده طراحی کن و از جمع بپرس."],
["bold","fun","یک اجرای دوبله برای صحنه‌ای خیالی انجام بده."],
["bold","social","یک عادت خوب که می‌خوای از فردا شروع کنی اعلام کن."],
["bold","friends","یک لقب گروهی خلاقانه برای خودتون انتخاب کن."],
["bold","creative","در ۱۵ ثانیه یک اپلیکیشن عجیب معرفی کن و کاربردش رو بگو."],
["bold","fun","یک سخنرانی انتخاباتی برای رئیس شدن در این جمع انجام بده."],
["easy","fun","مثل پنگوئن ۱۰ قدم راه برو."],
["easy","creative","یک وسیله نزدیکت رو با سه ویژگی عجیب توصیف کن."],
["easy","friends","از نفر سمت چپت بخواه یک ژست بده و همون رو تکرار کن."],
["easy","fun","اسم پنج کشور رو در ده ثانیه بگو."],
["easy","school","یک فرمول یا نکته درسی رو با ریتم آهنگ بخون."],
["easy","creative","یک شعار تبلیغاتی برای آب بساز."],
["easy","fun","برای ۲۰ ثانیه وانمود کن روی ماه راه می‌ری."],
["easy","social","یک جمله خوب درباره خودت بگو."],
["medium","fun","یک دقیقه فقط با سؤال جواب بده."],
["medium","creative","یک داستان ۴ جمله‌ای بساز که پایان غیرمنتظره داشته باشه."],
["medium","friends","از جمع بخواه یک حرکت گروهی ساده انتخاب کنن و با هم انجام بدید."],
["medium","fun","یک وسیله رو بدون گفتن اسمش تبلیغ کن."],
["medium","school","یک موضوع دلخواه رو مثل معلم‌ها پای تخته خیالی درس بده."],
["medium","creative","یک اسم برای یک سیاره خیالی و سه قانونش بساز."],
["medium","social","یک تعریف صادقانه از خودت بکن."],
["bold","fun","۳۰ ثانیه گزارشگر مسابقه‌ای باش که هیچ اتفاقی توش نمی‌افته."],
["bold","creative","با سه شیء اطرافت یک داستان ماجراجویی بساز."],
["bold","friends","از یکی از افراد جمع بخواه یک سؤال بامزه بپرسه و فوری جواب بده."],
["medium","fun","یک جمله رو با صدای آهسته، بلند و هیجان‌زده تکرار کن."],
["easy","creative","یک اسم هنری برای خودت انتخاب کن و معرفی‌اش کن."],
["medium","school","یک خاطره رو طوری تعریف کن که انگار تریلر فیلمه."],
["bold","social","یک هدف کوتاه‌مدتت رو اعلام کن و اولین قدمش رو بگو."],
["easy","fun","با دست‌هات شکل یک حیوان رو بساز."],
["medium","friends","برای نفر روبه‌روت یک کارت دعوت خیالی به یک سفر طراحی کن."],
["bold","creative","در ۲۰ ثانیه یک بازی جدید با قوانین ساده اختراع کن."],
["easy","fun","یک جمله سخت رو سه بار سریع و درست بگو."],
["medium","social","یک نکته مثبت که از این جمع یاد گرفتی بیان کن."],
["bold","fun","نقش فروشنده‌ای رو بازی کن که می‌خواد یک سنگ معمولی بفروشه."],
["easy","school","اسم سه کتاب یا فیلم رو با لحن معلم انضباط بگو."],
["medium","creative","یک اسم و داستان کوتاه برای یک ابرقهرمان بساز."],
["bold","friends","یک خاطره مشترک خوب رو به شکل تیتر روزنامه تعریف کن."],
["easy","fun","۱۰ ثانیه ادای راه رفتن یک اردک رو دربیار."],
["medium","school","یک زنگ تفریح ایده‌آل رو در ۲۰ ثانیه توصیف کن."],
["bold","creative","یک محصول خیالی بساز که مشکل خنده‌داری رو حل می‌کنه."],
["medium","fun","یک آهنگ رو با صدای ربات بخون."],
["easy","friends","یک تشکر کوتاه و واقعی از جمع بکن."],
["bold","social","یک ترس کوچیک رو نام ببر و یک راه روبه‌رو شدن باهاش بگو."],
["medium","creative","یک اسم عجیب برای یک رستوران خیالی انتخاب کن و منوش رو معرفی کن."],
["easy","fun","تا ده ثانیه با دست غیرغالب خودت شکل یک ستاره بکش."],
["bold","school","یک درس رو در قالب یک پیام تبلیغاتی ۱۵ ثانیه‌ای معرفی کن."],
["medium","friends","یک خاطره خنده‌دار از خودت تعریف کن که کسی اینجا نشنیده."],
["easy","creative","یک حرکت مخصوص سلام کردن برای این جمع بساز."],
["bold","fun","یک گزارش زنده از سفر خیالی به مریخ اجرا کن."],
["medium","social","یک ویژگی خوب در جمع رو نام ببر که دوست داری بیشتر ببینی."],
["easy","fun","با سه حالت چهره مختلف یک داستان کوتاه تعریف کن."],
["bold","creative","در ۲۰ ثانیه یک شعار برای نجات دنیا بساز."],
["medium","friends","از جمع بخواه یک کلمه انتخاب کنن و باهاش یک بیت بساز."],
["easy","school","یک قانون عجیب اما مفید برای زنگ تفریح پیشنهاد بده."],
["bold","fun","برای یک لیوان آب مراسم رونمایی رسمی برگزار کن."],
["medium","creative","یک وسیله معمولی رو به عنوان ابزار سفر در زمان معرفی کن."],
["easy","social","یک جمله تشویقی برای نفر بعدی بازی بگو."],
["bold","friends","یک لقب مثبت و بامزه برای کل گروه بساز و دلیلش رو توضیح بده."]
];
const extraTruths = [["easy","friends","بیشتر از همه چه چیزی رو دوست داری؟"],["easy","fun","این روزها چه خبر؟"],["easy","fun","الان مشغول چه کاری هستی؟"],["easy","friends","از یک تا ده به حال‌وهوای امروزت چند می‌دی؟"],["easy","friends","چه چیزی باعث می‌شه یک نفر برات ارزشمند باشه؟"],["easy","friends","تا حالا عاشق شدی یا از کسی خوشت اومده؟"],["easy","fun","آهنگی که این روزها زیاد گوش می‌دی چیه؟"],["easy","creative","عشق یا پول؛ کدوم رو انتخاب می‌کنی و چرا؟"],["easy","creative","دوست داشتی همیشه در چه سنی بمونی؟"],["easy","fun","الان بیشتر به چی فکر می‌کنی؟"],["easy","creative","رنگ مورد علاقه‌ات چیه؟"],["easy","fun","حیوان مورد علاقه‌ات چیه؟"],["easy","creative","برف یا بارون؟"],["easy","friends","خودت رو در سه کلمه توصیف کن."],["easy","fun","فیلم مورد علاقه‌ات چیه؟"],["easy","creative","دوست داری به کجا سفر کنی؟"],["easy","creative","شب یا روز؟"],["medium","friends","از چه رفتاری در دوستی خوشت نمیاد؟"],["easy","friends","برای یکی از دوستانت چه آرزویی داری؟"],["easy","creative","در یک کلمه بگو این روزها چقدر خوشحالی."],["easy","creative","فقیر ولی خوشحال یا پولدار ولی ناراحت؟"],["easy","fun","غذای مورد علاقه‌ات چیه؟"],["easy","creative","دوست داری چه چیزی رو درباره دنیا بفهمی؟"],["easy","creative","دایی یا عمو؟"],["easy","friends","چه جور آدمی هستی؛ آروم یا پرانرژی؟"],["easy","fun","از آدم‌های اطرافت چه چیزی یاد گرفتی؟"],["easy","fun","استیکری که بیشتر از همه استفاده می‌کنی چیه؟"],["easy","creative","هایده یا گوگوش؟"],["easy","creative","استقلال یا پرسپولیس؟"],["easy","creative","چه ماهی به دنیا اومدی؟"],["easy","creative","اگه می‌تونستی جای خودت رو با یک شخصیت معروف عوض کنی، کی رو انتخاب می‌کردی؟"],["easy","creative","دلت می‌خواد همین الان کجا باشی؟"],["easy","fun","معمولاً شب‌ها تا چه ساعتی بیداری؟"],["medium","friends","از جمعی که باهاش وقت می‌گذرونی راضی هستی؟ چرا؟"],["medium","friends","چه چیزی ممکنه باعث بشه از یک جمع فاصله بگیری؟"],["medium","social","در روز چند بار به هدف یا آرزوی مهمت فکر می‌کنی؟"],["medium","social","گذشته رو چطور می‌بینی؛ درس یا حسرت؟"],["medium","social","از زندگی‌ات چه چیزی رو بیشتر دوست داری؟"],["easy","friends","چه کسی بهتر از همه می‌تونه آرومت کنه؟"],["medium","friends","چه چیزی باعث می‌شه یک نفر جزو آدم‌های مهم زندگیت بشه؟"],["easy","friends","خرید یا خونه موندن؟"],["medium","social","وقتی ناراحتی ترجیح می‌دی تنها باشی یا با کسی حرف بزنی؟"],["easy","creative","چیپس یا پفک؟"],["easy","creative","موی فر یا صاف؟"],["easy","creative","جنگل یا دریا؟"],["easy","creative","سرما یا گرما؟"],["easy","creative","شمال یا کیش؟"],["easy","fun","آشپزی بلدی؟ غذای مخصوصت چیه؟"],["easy","creative","نوشیدنی مورد علاقه‌ات چیه؟"],["medium","social","از کدوم ویژگی خودت بیشتر خوشت میاد؟"],["easy","creative","بهترین کتابی که خوندی چی بوده؟"],["easy","school","بهترین درسی که تا حالا یاد گرفتی چی بوده؟"],["easy","school","معلم مورد علاقه‌ات چه ویژگی‌ای داشت؟"],["medium","social","بهترین درسی که زندگی بهت داده چی بوده؟"],["medium","friends","چه کاری باعث می‌شه احترامت نسبت به یک نفر کم بشه؟"],["medium","social","اگه یک نوشیدنی جادویی فقط یک آرزوت رو برآورده کنه، آرزوت چیه؟"],["medium","creative","اگه می‌تونستی زمان رو برای یک لحظه متوقف کنی، چه کار می‌کردی؟"],["medium","social","چه حسی رو هیچ‌وقت فراموش نمی‌کنی؟"],["medium","creative","اگه می‌تونستی یک روز جای یک نفر دیگه باشی، چه کسی رو انتخاب می‌کردی؟"],["easy","creative","آرومی یا شیطون؟"],["medium","friends","چه چیزی باعث می‌شه به یک نفر وابسته بشی؟"],["medium","social","یکی از آرزوهایی که هنوز براش تلاش می‌کنی چیه؟"],["easy","creative","جنگل یا دریا؛ چرا؟"],["easy","fun","از چه حیوانی می‌ترسی؟"],["easy","fun","از چه میوه‌ای خوشت نمیاد؟"],["medium","friends","در یک رابطه یا دوستی چه چیزی برات از همه مهم‌تره؟"],["medium","social","چه چیزی باعث می‌شه به یک نفر اعتماد کنی؟"],["easy","creative","پارتنر پرحرف و پیگیر یا آروم و بی‌حاشیه؟"],["easy","creative","دختر یا پسر آروم یا پرانرژی؛ کدوم اخلاق رو بیشتر می‌پسندی؟"],["easy","fun","قدرت رانندگی داری یا هنوز یاد نگرفتی؟"],["easy","creative","اگه رایگان به یک کنسرت بری، کنسرت چه کسی رو انتخاب می‌کنی؟"],["easy","fun","آهنگی که همیشه حالت رو خوب می‌کنه چیه؟"],["easy","creative","شخصیت کارتونی مورد علاقه‌ات کیه؟"],["easy","creative","اکسسوری مورد علاقه‌ات چیه؟"],["easy","creative","چه گلی رو بیشتر دوست داری؟"],["medium","social","سبک زندگی ایده‌آلت چه شکلیه؟"],["medium","social","یک خاطره از بچگی تعریف کن."],["medium","social","چه ویژگی‌ای رو دوست داری طرف مقابلت داشته باشه؟"],["medium","social","یک حس قشنگ که هیچ‌وقت یادت نمی‌ره چیه؟"],["medium","fun","بدترین خرابکاری بی‌ضرری که در بچگی کردی چی بود؟"],["medium","friends","تا حالا شده دلت برای کسی بسوزه ولی چیزی نگی؟"],["medium","creative","اگه نامرئی می‌شدی، اولین کار بی‌خطرت چی بود؟"],["medium","creative","اگه می‌تونستی یک روز در بدن یک شخصیت خیالی باشی، کی رو انتخاب می‌کردی؟"],["medium","friends","تا حالا برای فهمیدن یک موضوع بی‌ضرر نقش کارآگاه بازی کردی؟"],["easy","creative","از چه میوه‌ای بیشتر خوشت میاد؟"],["medium","social","چه ویژگی‌ای در ظاهرت یا شخصیتت رو بیشتر دوست داری؟"],["medium","creative","اگه می‌تونستی یک صدای خاص داشته باشی، چه صدایی انتخاب می‌کردی؟"],["easy","creative","دوست داشتی جای کدوم بازیگر در چه فیلمی باشی؟"],["easy","fun","بهترین فیلمی که دیدی چی بوده؟"],["medium","creative","اگه فقط یک رنگ در دنیا باقی می‌موند، کدوم رو انتخاب می‌کردی؟"],["medium","creative","اگه یک در مخفی به یک دنیای عجیب باز بشه، واردش می‌شی؟"],["medium","social","کدوم ویژگی رو دوست داری دیگران بیشتر در تو ببینن؟"],["medium","social","چه حرفی هست که مدت‌هاست دوست داری بزنی ولی فرصت نشده؟"],["medium","creative","اگه یک روز بدون اینترنت و پیام باشی، چطور وقت می‌گذرونی؟"],["medium","friends","اگه لازم باشه یک راز معمولی رو با فردی قابل اعتماد در میون بذاری، چه کسی رو انتخاب می‌کنی؟"],["medium","creative","اگه می‌تونستی یک کار رو دوباره برای اولین بار تجربه کنی، چی بود؟"],["medium","friends","وقتی ناراحتی اولین کسی که به ذهنت می‌رسه کیه؟"],["medium","social","بزرگ‌ترین تغییری که در خودت دیدی چی بوده؟"],["medium","social","کدوم خاطره رو هیچ‌وقت دوست نداری فراموش کنی؟"],["medium","social","چه چیزی باعث شده احساس کنی برای کسی خاص هستی؟"],["medium","social","چه ویژگی‌ای رو دوست داری در خودت تقویت کنی؟"],["medium","creative","اگه یک روز هیچ تماس و پیامی نداشته باشی، چه کار می‌کنی؟"],["medium","social","وقتی ناراحتی چه چیزی بیشتر از همه آرومت می‌کنه؟"],["easy","fun","خنده‌دارترین اتفاقی که در جمع دوستات افتاده چی بوده؟"],["easy","fun","خنده‌دارترین اشتباه آشپزی‌ات چی بوده؟"],["medium","social","اگه می‌تونستی یک خاطره رو دوباره زندگی کنی، کدوم بود؟"],["medium","creative","بین همیشه نخوابیدن و همیشه غذا نخوردن، کدوم رو انتخاب می‌کنی؟"],["easy","fun","خنده‌دارترین لباسی که پوشیدی چی بوده؟"],["medium","social","تا حالا رازی رو با کسی که تازه آشنا شده بودی در میون گذاشتی؟"],["easy","creative","اگه یک قدرت ماورایی داشته باشی، چی انتخاب می‌کنی؟"],["easy","fun","بدترین غذایی که تا حالا خوردی چی بوده؟"],["medium","creative","بین همیشه سردت بودن و همیشه گرمت بودن، کدوم رو انتخاب می‌کنی؟"],["easy","creative","اگه می‌تونستی یک فیلم رو از اول بسازی، کدوم رو انتخاب می‌کردی؟"],["easy","fun","بامزه‌ترین کاری که وقتی تنهایی انجام می‌دی چیه؟"],["medium","social","بین همیشه خوشحال بودن و همیشه آرامش داشتن، کدوم رو انتخاب می‌کنی؟"],["easy","creative","صبح زود بیدار شدن یا شب دیر خوابیدن؟"],["medium","social","اگه می‌تونستی یک خاطره رو پاک کنی، کدوم رو انتخاب می‌کردی؟"],["easy","creative","همیشه خونه موندن یا همیشه سفر رفتن؟"],["medium","social","بدترین عادتی که دوست داری تغییرش بدی چیه؟"],["easy","creative","ترجیح می‌دی همیشه موسیقی گوش بدی یا پادکست؟"],["medium","fun","آخرین کار بچگانه‌ای که انجام دادی چی بود؟"],["easy","creative","اگه می‌تونستی یک زبان جدید یاد بگیری، کدوم رو انتخاب می‌کردی؟"],["medium","social","چه چیزی باعث می‌شه از خجالت سرخ بشی؟"],["easy","fun","بامزه‌ترین اتفاقی که در جمع دوستات افتاده چی بوده؟"],["medium","social","بدترین هدیه‌ای که گرفتی چی بوده؟"],["easy","creative","ترجیح می‌دی همیشه در یک اتاق باشی یا همیشه در پارک؟"],["medium","fun","تا حالا اسم کسی رو اشتباهی صدا زدی؟ چه اتفاقی افتاد؟"],["easy","creative","ترجیح می‌دی همیشه ساده لباس بپوشی یا همیشه رسمی؟"],["medium","social","تا حالا یک راز بی‌ضرر رو برای خودت نگه داشتی چون زمان گفتنش مناسب نبوده؟"]];
const extraDares = [["easy","fun","با صدای گوینده اخبار بگو الان در این جمع چه خبره."],["easy","friends","به یک نفر از جمع یک تعریف واقعی و محترمانه بکن."],["easy","fun","یک ویس کوتاه با صدای ربات بگو: سلام، روزت بخیر!"],["easy","creative","یک حیوان رو بدون حرف زدن تقلید کن تا بقیه حدس بزنن."],["easy","fun","۲۰ ثانیه مثل ربات راه برو."],["easy","fun","یک آهنگ رو فقط با زمزمه اجرا کن."],["easy","friends","برای نفر روبه‌روت یک لقب مثبت و بامزه بساز."],["easy","creative","با سه کلمه‌ای که جمع انتخاب می‌کنه یک داستان بساز."],["easy","fun","مثل گزارشگر فوتبال، باز شدن یک در رو گزارش کن."],["easy","school","یک درس رو مثل تبلیغ تلویزیونی معرفی کن."],["easy","fun","یک جمله ساده رو با سه احساس متفاوت بگو."],["easy","creative","یک شعر دوخطی درباره وسیله‌ای که نزدیکته بساز."],["easy","friends","یک خاطره خوب از جمع تعریف کن."],["easy","fun","تا نوبت بعدی با لحن یک شخصیت کارتونی حرف بزن."],["easy","social","از یکی از افراد جمع بابت یک کار خوبش تشکر کن."],["easy","fun","اسم پنج کشور رو در ده ثانیه بگو."],["easy","creative","یک شعار تبلیغاتی برای آب بساز."],["easy","fun","برای ۲۰ ثانیه وانمود کن روی ماه راه می‌ری."],["easy","friends","یک ویژگی مثبت از دو نفر کنارت بگو."],["easy","creative","یک اسم جدید برای این بازی اختراع کن."],["medium","fun","۳۰ ثانیه با لهجه ساختگی و محترمانه صحبت کن."],["medium","creative","در ۲۰ ثانیه یک تبلیغ خلاقانه برای خودکار بساز."],["medium","school","یک خاطره مدرسه رو مثل تریلر فیلم تعریف کن."],["medium","social","یک مهارت کوچک به جمع آموزش بده."],["medium","fun","یک شخصیت خیالی رو تقلید کن تا بقیه حدس بزنن."],["medium","friends","برای نفر سمت چپت یک معرفی افتخاری ۱۵ ثانیه‌ای انجام بده."],["medium","school","یک قانون خنده‌دار برای مدرسه پیشنهاد بده و ازش دفاع کن."],["medium","creative","داستانی بساز که کلمات گربه، فضا و پیتزا توش باشه."],["medium","friends","با اجازه همه یک عکس گروهی خلاقانه بگیرید؛ هرکس نخواست، فقط ژست بگیره."],["medium","social","یک جمله انگیزشی واقعی برای نفر روبه‌روت بگو."],["medium","fun","۱۵ ثانیه حرکت آهسته اجرا کن."],["medium","creative","یک وسیله انتخاب کن و وانمود کن اختراع قرن رو ساختی."],["medium","fun","یک تکه از آهنگ مورد علاقه‌ات رو اجرا کن."],["medium","creative","در ۳۰ ثانیه یک شخصیت خیالی با اسم و قدرت ویژه بساز."],["medium","social","یک پیام مثبت کوتاه برای آینده خودت با صدای بلند بگو."],["medium","creative","یک معمای ساده طراحی کن و از جمع بپرس."],["medium","fun","یک اجرای دوبله برای صحنه‌ای خیالی انجام بده."],["medium","friends","از هر نفر یک کلمه بگیر و با همه‌شون یک جمله بساز."],["medium","fun","یک سخنرانی انتخاباتی برای رئیس شدن در این جمع انجام بده."],["medium","creative","یک اسم برای سیاره خیالی و سه قانونش بساز."],["medium","fun","یک دقیقه فقط با سؤال جواب بده."],["medium","friends","از جمع بخواه یک حرکت گروهی ساده انتخاب کنن و با هم انجام بدید."],["medium","school","یک موضوع دلخواه رو مثل معلم‌ها درس بده."],["medium","social","یک تعریف صادقانه از خودت بکن."],["medium","creative","یک کارت دعوت خیالی برای سفر به نفر روبه‌روت ارائه کن."],["medium","fun","یک جمله سخت رو سه بار سریع و درست بگو."],["medium","social","یک نکته مثبت که از این جمع یاد گرفتی بیان کن."],["medium","fun","نقش فروشنده‌ای رو بازی کن که می‌خواد یک سنگ معمولی بفروشه."],["easy","fun","۱۰ ثانیه ادای راه رفتن یک اردک رو دربیار."],["medium","creative","یک اسم و داستان کوتاه برای یک ابرقهرمان بساز."],["medium","school","یک زنگ تفریح ایده‌آل رو در ۲۰ ثانیه توصیف کن."],["bold","fun","۳۰ ثانیه گزارشگر مسابقه‌ای باش که هیچ اتفاقی توش نمی‌افته."],["bold","creative","با سه شیء اطرافت یک داستان ماجراجویی بساز."],["bold","friends","از یکی از افراد جمع بخواه یک سؤال بامزه بپرسه و فوری جواب بده."],["bold","social","یک هدف کوتاه‌مدتت رو اعلام کن و اولین قدمش رو بگو."],["bold","creative","در ۲۰ ثانیه یک بازی جدید با قوانین ساده اختراع کن."],["bold","fun","نقش فروشنده‌ای رو بازی کن که می‌خواد یک محصول کاملاً خیالی بفروشه."],["bold","friends","برای کل جمع یک اسم تیمی و شعار بساز."],["bold","fun","یک داستان عادی رو طوری تعریف کن انگار اتفاقی تاریخی بوده."],["bold","creative","یک اپلیکیشن عجیب معرفی کن و کاربردش رو توضیح بده."],["bold","social","یک عادت خوب که می‌خوای از فردا شروع کنی اعلام کن."]];
truths.push(...extraTruths);
dares.push(...extraDares);
const labels={fun:"خنده‌دار",friends:"دوستانه",school:"مدرسه و خاطره",creative:"خلاقانه",social:"اجتماعی"};
const STORAGE_KEY="tod_state_v2";
let restored={};
try{restored=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{}}catch(e){}
let legacyPlayers=[];
try{legacyPlayers=JSON.parse(localStorage.getItem("tod_players")||"[]")}catch(e){}
let players=Array.isArray(restored.players)?restored.players:(Array.isArray(legacyPlayers)?legacyPlayers:[]);
let round=Number.isFinite(Number(restored.round))?Number(restored.round):0;
let asker=typeof restored.asker==="string"?restored.asker:"";
let answerer=typeof restored.answerer==="string"?restored.answerer:"";
let kind=restored.kind==="truth"||restored.kind==="dare"?restored.kind:"";
let current=Array.isArray(restored.current)?restored.current:null;
let used=new Set(Array.isArray(restored.used)?restored.used:[]);
let history=Array.isArray(restored.history)?restored.history.slice(0,12):[];
let stage=["idle","choose","prompt","next"].includes(restored.stage)?restored.stage:"idle";
const $=id=>document.getElementById(id);
const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({players,round,asker,answerer,kind,current,used:[...used],history,stage,level:$("level").value,category:$("category").value}));}catch(e){toast("ذخیره‌سازی مرورگر در دسترس نیست.");}};
function toast(s){$("toast").textContent=s;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2100)}
function renderPlayers(){$("players").innerHTML="";players.forEach((n,i)=>{const chip=document.createElement("span");chip.className="player";const t=document.createElement("span");t.textContent=n;const b=document.createElement("button");b.type="button";b.textContent="×";b.setAttribute("aria-label","حذف "+n);b.onclick=()=>{players.splice(i,1);save();renderPlayers()};chip.append(t,b);$("players").append(chip)});$("count").textContent=players.length+" بازیکن";$("startBtn").disabled=players.length<2;$("startBtn").style.opacity=players.length<2?".55":"1"}
$("addForm").addEventListener("submit",e=>{e.preventDefault();const n=$("nameInput").value.trim().replace(/\s+/g," ");if(!n)return;if(players.some(x=>x.toLocaleLowerCase()===n.toLocaleLowerCase()))return toast("این اسم قبلاً اضافه شده.");players.push(n);save();$("nameInput").value="";renderPlayers();$("nameInput").focus()});
function pickPair(){const a=[...players].sort(()=>Math.random()-.5);asker=a[0];answerer=a[1];if(players.length>2&&history.length){let tries=0;while(history.length&&history[history.length-1].asker===asker&&history[history.length-1].answerer===answerer&&tries++<12){const b=[...players].sort(()=>Math.random()-.5);asker=b[0];answerer=b[1]}}}
function start(){if(players.length<2)return toast("حداقل دو بازیکن اضافه کن.");round++;pickPair();stage="choose";current=null;$("empty").classList.add("hidden");$("active").classList.remove("hidden");$("asker").textContent=asker;$("answerer").textContent=answerer;$("answererName").textContent=answerer;$("round").textContent="دور "+round;$("choose").classList.remove("hidden");$("promptBox").classList.add("hidden");$("nextBtn").classList.add("hidden");current=null;save()}
function getPrompt(type){const level=$("level").value,cat=$("category").value;let pool=(type==="truth"?truths:dares).filter(x=>(level==="all"||x[0]===level)&&(cat==="all"||x[1]===cat));let fresh=pool.filter(x=>!used.has(type+"|"+x[2]));if(!fresh.length){pool.forEach(x=>used.delete(type+"|"+x[2]));fresh=pool}if(!fresh.length)return null;const p=fresh[Math.floor(Math.random()*fresh.length)];used.add(type+"|"+p[2]);return p}
function showPrompt(type){kind=type;current=getPrompt(type);if(!current)return toast("برای این فیلتر موردی پیدا نشد.");$("choose").classList.add("hidden");$("promptBox").classList.remove("hidden");$("nextBtn").classList.add("hidden");$("promptKind").textContent=(type==="truth"?"حقیقت":"جرئت")+" · "+labels[current[1]]+" · "+(current[0]==="easy"?"آسان":current[0]==="medium"?"متوسط":"جسورانه");$("promptText").textContent=current[2];stage="prompt";save()}
$("truthBtn").onclick=()=>showPrompt("truth");$("dareBtn").onclick=()=>showPrompt("dare");$("anotherBtn").onclick=()=>showPrompt(kind);
function finish(){if(!current)return;history.unshift({asker,answerer,kind,text:current[2]});history=history.slice(0,12);renderHistory();$("promptBox").classList.add("hidden");$("nextBtn").classList.remove("hidden");stage="next";save()}
$("doneBtn").onclick=finish;$("nextBtn").onclick=start;$("startBtn").onclick=()=>{round=0;history=[];used.clear();renderHistory();start()};
function renderHistory(){$("history").innerHTML="";if(!history.length){$("history").innerHTML='<div class="sub">هنوز دوری ثبت نشده.</div>';return}history.forEach((h,i)=>{const d=document.createElement("div");d.className="history-item";const left=document.createElement("span");const strong=document.createElement("strong");strong.textContent=h.answerer;left.append(strong,document.createTextNode(" · "+(h.kind==="truth"?"حقیقت":"جرئت")));const right=document.createElement("span");right.textContent=h.asker+" پرسید";d.append(left,right);$("history").append(d)})}
$("clearHistory").onclick=()=>{history=[];round=0;renderHistory();save();toast("تاریخچه پاک شد.")};
$("level").value=restored.level||"all";
$("category").value=restored.category||"all";
$("level").addEventListener("change",save);
$("category").addEventListener("change",save);
function restoreGame(){
  const validPair=asker&&answerer&&asker!==answerer;
  if(!validPair||!["choose","prompt","next"].includes(stage)){
    stage="idle";
    $("empty").classList.remove("hidden");
    $("active").classList.add("hidden");
    return;
  }
  $("empty").classList.add("hidden");
  $("active").classList.remove("hidden");
  $("asker").textContent=asker;
  $("answerer").textContent=answerer;
  $("answererName").textContent=answerer;
  $("round").textContent="دور "+round;
  $("choose").classList.toggle("hidden",stage!=="choose");
  $("promptBox").classList.toggle("hidden",stage!=="prompt");
  $("nextBtn").classList.toggle("hidden",stage!=="next");
  if(stage==="prompt"&&current&&current[2]){
    $("promptKind").textContent=(kind==="truth"?"حقیقت":"جرئت")+" · "+labels[current[1]]+" · "+(current[0]==="easy"?"آسان":current[0]==="medium"?"متوسط":"جسورانه");
    $("promptText").textContent=current[2];
  }else if(stage==="prompt"){
    stage="choose";
    $("choose").classList.remove("hidden");
    $("promptBox").classList.add("hidden");
  }
  save();
}
renderPlayers();
renderHistory();
restoreGame();
let deferredInstallPrompt=null;
const installButton=$("installBtn");
window.addEventListener("beforeinstallprompt",event=>{
  event.preventDefault();
  deferredInstallPrompt=event;
  installButton.classList.remove("hidden");
});
window.addEventListener("appinstalled",()=>{
  deferredInstallPrompt=null;
  installButton.classList.add("hidden");
  toast("بازی روی دستگاه نصب شد.");
});
installButton.addEventListener("click",async()=>{
  if(!deferredInstallPrompt){
    toast("از منوی مرورگر گزینه «افزودن به صفحه اصلی» رو انتخاب کن.");
    return;
  }
  deferredInstallPrompt.prompt();
  const choice=await deferredInstallPrompt.userChoice;
  if(choice.outcome==="accepted")toast("درخواست نصب تأیید شد.");
  deferredInstallPrompt=null;
  installButton.classList.add("hidden");
});

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{}));
}

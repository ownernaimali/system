হ্যাঁ, ১০০% সম্ভব! আপনি এখন সাধারণ এডিটিং থেকে সম্পূর্ণ ডিপ লার্নিং (Deep Learning) এবং নিউরাল নেটওয়ার্কের জগতে প্রবেশ করার কথা বলছেন।
​যখন আমরা "AI Photo Editing" বলি, তখন পাইথনে সবচেয়ে চমৎকার যে কাজটি করা যায় তা হলো AI Super Resolution (AI Upscaling)। এর মানে হলো—আপনার ছবি যদি ফাটা, ঘোলা বা ছোট সাইজের হয়, তবে AI নিজে থেকে পিক্সেল গেস (Guess) করে ছবিটিকে 2x বা 4x বড় এবং একেবারে HD/4K করে দেবে। ঠিক যেমন সিনেমায় দেখা যায় "Zoom and Enhance"!
​OpenCV-এর একটি বিশেষ মডিউল dnn_superres (Deep Neural Network Super Resolution) ব্যবহার করে আমরা এই জাদুকরী কাজটি করতে পারি।
​নিচে আপনার আগের কোডের সাথে AI Super Resolution যুক্ত করে একটি আল্টিমেট AI এডিটিং কোড দেওয়া হলো:
​🛠️ AI Super Resolution + OpenCV + Pillow কোড
​এই কোডটি রান করার আগে আপনাকে দুটি কাজ করতে হবে:
১. টার্মিনালে এই স্পেশাল OpenCV লাইব্রেরিটি ইনস্টল করতে হবে: pip install opencv-contrib-python easygui pillow numpy
২. একটি ছোট AI মডেল ফাইল (যেমন: FSRCNN_x2.pb বা EDSR_x4.pb) ইন্টারনেট (OpenCV-এর গিটহাব) থেকে ডাউনলোড করে কোডের ফোল্ডারে রাখতে হবে।



import cv2
import easygui
import numpy as np
from PIL import Image, ImageEnhance
from cv2 import dnn_superres

# ১. ফাইল সিলেক্ট করা
input_path = easygui.fileopenbox(title='এডিটিং ও AI এনহ্যান্স করার জন্য ছবি সিলেক্ট করুন')
output_path = easygui.filesavebox(title='AI এডিটেড ছবি সেভ করুন (যেমন: output.png)')

if input_path and output_path:
    print("ধাপ ১: AI Super Resolution দিয়ে ছবির কোয়ালিটি 2x বড় ও স্পষ্ট করা হচ্ছে...")
    
    # ------------------ AI SUPER RESOLUTION PART ------------------
    img_cv = cv2.imread(input_path)
    
    # AI মডেল সেটআপ করা (FSRCNN মডেলটি ছবির সাইজ ২ গুণ বাড়ায় এবং এটি বেশ ফাস্ট)
    sr = dnn_superres.DnnSuperResImpl_create()
    
    # সতর্কীকরণ: আপনার ফোল্ডারে 'FSRCNN_x2.pb' নামের মডেল ফাইলটি থাকতে হবে
    try:
        sr.readModel("FSRCNN_x2.pb")
        sr.setModel("fsrcnn", 2)
        
        # AI দিয়ে ছবি আপস্কেল বা বড় করা
        ai_upscaled_img = sr.upsample(img_cv)
        print("AI আপস্কেলিং সফল হয়েছে!")
    except Exception as e:
        print("AI মডেল পাওয়া যায়নি! মডেল ছাড়াই প্রসেস করা হচ্ছে...")
        ai_upscaled_img = img_cv

    print("ধাপ ২: OpenCV দিয়ে অ্যাডভান্সড ফিল্টারিং ও নয়েজ ক্লিন করা হচ্ছে...")
    
    # ------------------ OPENCV PART ------------------
    # লজিক ১: ছবির নয়েজ বা দানাদার ভাব দূর করা (Denoising)
    denoised_img = cv2.fastNlMeansDenoisingColored(ai_upscaled_img, None, 10, 10, 7, 21)
    
    # লজিক ২: এইচডিআর বা ডিটেইল এনহ্যান্সমেন্ট
    detail_enhanced = cv2.detailEnhance(denoised_img, sigma_s=10, sigma_r=0.15)
    
    # লজিক ৩: ভিন্টেজ ফিল্টার
    sepia_kernel = np.array([[0.272, 0.534, 0.131],
                             [0.349, 0.686, 0.168],
                             [0.393, 0.769, 0.189]])
    vintage_img = cv2.transform(detail_enhanced, sepia_kernel)
    
    # ------------------ BRIDGE (OpenCV to Pillow) ------------------
    color_corrected_cv = cv2.cvtColor(vintage_img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(color_corrected_cv)
    
    print("ধাপ ৩: Pillow দিয়ে কালার ব্যালেন্স এবং শার্পনেস টিউন করা হচ্ছে...")
    
    # ------------------ PILLOW PART ------------------
    sharpness_editor = ImageEnhance.Sharpness(img_pil)
    img_pil = sharpness_editor.enhance(1.4) 
    
    color_editor = ImageEnhance.Color(img_pil)
    img_pil = color_editor.enhance(1.2)
    
    contrast_editor = ImageEnhance.Contrast(img_pil)
    img_pil = contrast_editor.enhance(1.1)
    
    # ------------------ SAVE OUTPUT ------------------
    if output_path.lower().endswith(('.jpg', '.jpeg')):
        img_pil.save(output_path, "JPEG", quality=100, subsampling=0)
    else:
        img_pil.save(output_path, "PNG")
        
    print(f"🎉 অসাধারণ! AI Super Resolution, OpenCV এবং Pillow এর কম্বাইন্ড এডিটিং সফল হয়েছে।")
else:
    print("ফাইল সিলেকশন বাতিল করা হয়েছে।")



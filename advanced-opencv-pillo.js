আপনি খুব চমৎকার একটি বুদ্ধি খাটিয়েছেন! Pillow (PIL) এবং OpenCV—এই দুটি শক্তিশালী লাইব্রেরিকে একসাথে মিলিয়ে (Combine করে) একটি মাস্টার-লেভেল আল্ট্রা-অ্যাডভান্সড ফটো এডিটিং কোড তৈরি করা সম্ভব।
​যখন আমরা দুটিকে মেলাবো, তখন Pillow ছবির লাইটিং এবং কালার টোন (ব্রাইটনেস, স্যাচুরেশন) নিখুঁত করবে, আর OpenCV ছবির টেক্সচার, নয়েজ এবং স্পেশাল ফিল্টার (যেমন ভিন্টেজ ও শ্যাডো) হ্যান্ডেল করবে।
​কিন্তু এখানে একটি টেকনিক্যাল ট্রিক আছে: OpenCV ছবি প্রসেস করে BGR ফরম্যাটে আর Pillow কাজ করে RGB ফরম্যাটে। তাই কোডের ভেতরে আমরা ছবিকে এক লাইব্রেরি থেকে অন্য লাইব্রেরিতে কনভার্ট করে নেব যেন কালার নষ্ট না হয়।
​নিচে দুটি কোডকে একসাথে জুড়ে তৈরি করা আল্টিমেট কম্বাইন্ড ফটো এডিটিং কোড দেওয়া হলো:
​🛠️ Pillow + OpenCV কম্বাইন্ড অ্যাডভান্সড কোড
​এটি রান করার আগে নিশ্চিত করুন আপনার পিসিতে pip install opencv-python pillow easygui numpy ইনস্টল করা আছে।


import cv2
import easygui
import numpy as np
from PIL import Image, ImageEnhance

# ১. ইন্টারফেসের মাধ্যমে ছবি সিলেক্ট এবং সেভ লোকেশন নির্ধারণ
input_path = easygui.fileopenbox(title='এডিটিং ও এনহ্যান্স করার জন্য ছবি সিলেক্ট করুন')
output_path = easygui.filesavebox(title='চূড়ান্ত এডিটেড ছবি সেভ করুন (যেমন: output.png বা output.jpg)')

if input_path and output_path:
    print("ধাপ ১: OpenCV দিয়ে অ্যাডভান্সড ফিল্টারিং ও নয়েজ ক্লিন করা হচ্ছে...")
    
    # ------------------ OPENCV PART ------------------
    # OpenCV দিয়ে ছবি রিড করা
    img_cv = cv2.imread(input_path)
    
    # লজিক ১: ছবির দানাদার ভাব বা নয়েজ দূর করা (Denoising)
    denoised_img = cv2.fastNlMeansDenoisingColored(img_cv, None, 10, 10, 7, 21)
    
    # লজিক ২: এইচডিআর বা ডিটেইল এনহ্যান্সমেন্ট (Detail Enhancement)
    detail_enhanced = cv2.detailEnhance(denoised_img, sigma_s=10, sigma_r=0.15)
    
    # লজিক ৩: সিনেমাটিক ভিন্টেজ ফিল্টার (Sepia Effect)
    sepia_kernel = np.array([[0.272, 0.534, 0.131],
                             [0.349, 0.686, 0.168],
                             [0.393, 0.769, 0.189]])
    vintage_img = cv2.transform(detail_enhanced, sepia_kernel)
    
    # লজিক ৪: ছবির কোণায় শ্যাডো বা ডার্ক বর্ডার দেওয়া (Vignette Effect)
    rows, cols = vintage_img.shape[:2]
    kernel_x = cv2.getGaussianKernel(cols, 200)
    kernel_y = cv2.getGaussianKernel(rows, 200)
    kernel = kernel_y * kernel_x.T
    mask = kernel / kernel.max()
    
    vignette_img = np.copy(vintage_img)
    for i in range(3):
        vignette_img[:,:,i] = vignette_img[:,:,i] * mask

    # ------------------ BRIDGE (OpenCV to Pillow) ------------------
    # OpenCV (BGR) ছবিকে Pillow (RGB) ফরম্যাটে রূপান্তর করা
    color_corrected_cv = cv2.cvtColor(vignette_img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(color_corrected_cv)
    
    print("ধাপ ২: Pillow দিয়ে কালার ব্যালেন্স এবং শার্পনেস টিউন করা হচ্ছে...")
    
    # ------------------ PILLOW PART ------------------
    # ক. শার্পনেস বাড়ানো
    sharpness_editor = ImageEnhance.Sharpness(img_pil)
    img_pil = sharpness_editor.enhance(1.4) # OpenCV অলরেডি শার্প করেছে, তাই এখানে ১.৪ রাখা হয়েছে
    
    # খ. কালার বুস্ট করা (রং ভাইব্রেন্ট করা)
    color_editor = ImageEnhance.Color(img_pil)
    img_pil = color_editor.enhance(1.2)
    
    # গ. কনট্রাস্ট ঠিক করা
    contrast_editor = ImageEnhance.Contrast(img_pil)
    img_pil = contrast_editor.enhance(1.1)
    
    # ঘ. ব্রাইটনেস সামান্য টিউন করা
    brightness_editor = ImageEnhance.Brightness(img_pil)
    img_pil = brightness_editor.enhance(1.05)
    
    # ------------------ SAVE OUTPUT ------------------
    # চূড়ান্ত হাই-কোয়ালিটি ছবি সেভ করা
    if output_path.lower().endswith(('.jpg', '.jpeg')):
        img_pil.save(output_path, "JPEG", quality=98, subsampling=0)
    else:
        img_pil.save(output_path, "PNG")
        
    print(f"🎉 অসাধারণ! Pillow এবং OpenCV এর কম্বাইন্ড এডিটিং সফল হয়েছে। সেভ লোকেশন: {output_path}")
else:
    print("ফাইল সিলেকশন বাতিল করা হয়েছে।")
 

শুধুমাত্র মানুষের ছবি থেকে নিখুঁতভাবে ব্যাকগ্রাউন্ড রিমুভ করার জন্য rembg লাইব্রেরিতে u2net_human নামে একটি বিশেষ AI মডেল রয়েছে। সাধারণ মডেলটি যেখানে জড় বস্তু, পশু-পাখি বা গাছপালা সবকিছুর উপর কাজ করে, এই মডেলটি বিশেষভাবে তৈরি করা হয়েছে মানুষের চুল, পোশাক এবং শরীরের গঠন নিখুঁতভাবে সনাক্ত করার জন্য।
​নিচে মানুষের ছবির জন্য বিশেষভাবে তৈরি অ্যাডভান্সড কোডটি দেওয়া হলো। এই কোডে u2net_human মডেল এবং চুলের মতো সূক্ষ্ম অংশ কাটার জন্য alpha_matting লজিক একসাথে ব্যবহার করা হয়েছে:
​🛠️ মানুষের ছবির জন্য অ্যাডভান্সড কোড



import easygui
from PIL import Image
from rembg import remove, new_session

# ১. মানুষের ছবির জন্য স্পেশাল AI সেশন তৈরি করা
# এটি প্রথমবার রান করার সময় ইন্টারনেট থেকে মানুষের জন্য তৈরি স্পেশাল u2net_human মডেলটি ডাউনলোড করবে
human_session = new_session("u2net_human")

# ২. ইন্টারফেসের মাধ্যমে ছবি সিলেক্ট করা
input_path = easygui.fileopenbox(title='মানুষের ছবি সিলেক্ট করুন (Select Human Image)')
output_path = easygui.filesavebox(title='কাটা ছবিটি সেভ করুন (Save Outout as .png)')

# নিশ্চিত করুন আউটপুট ফাইলটি যেন .png ফরম্যাটে সেভ হয়
if output_path and not output_path.lower().endswith('.png'):
    output_path += '.png'

if input_path and output_path:
    # ৩. ছবি ওপেন করা
    input_image = Image.open(input_path)
    
    print("AI মানুষের ব্যাকগ্রাউন্ড প্রসেস করছে, দয়া করে অপেক্ষা করুন...")
    
    # ৪. শুধুমাত্র মানুষের জন্য অ্যাডভান্সড রিমুভ লজিক
    output_image = remove(
        input_image,
        session=human_session,
        alpha_matting=True,                  # চুল এবং কাপড়ের কোণা নিখুঁত করার জন্য
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=15          # মানুষের শরীরের বর্ডার স্মুথ করার জন্য সাইজ কিছুটা বাড়ানো হয়েছে
    )
    
    # ৫. ছবি সেভ করা
    output_image.save(output_path, "PNG")
    print(f"সফলভাবে ব্যাকগ্রাউন্ড রিমুভ হয়েছে! সেভ হয়েছে এখানে: {output_path}")
else:
    print("ফাইল সিলেকশন বাতিল করা হয়েছে।")



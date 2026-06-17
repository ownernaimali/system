import easygui
from PIL import Image, ImageEnhance

# ১. ফাইল ওপেন এবং সেভ করার উইন্ডো
inputPath = easygui.fileopenbox(title='Select Image')
outputPath = easygui.filesavebox(title='Save Enhanced Image to..')

# ২. ছবি ওপেন করা
img = Image.open(inputPath)

# ৩. বেসিক এনহ্যান্স লজিক (শুধুমাত্র শার্পনেস বাড়ানো)
# ১.০ হলো নরমাল ছবি, ১.৫ দিলে ছবি কিছুটা স্পষ্ট বা শার্প হবে
editor = ImageEnhance.Sharpness(img)
enhanced_img = editor.enhance(1.5)

# ৪. ছবি সেভ করা
enhanced_img.save(outputPath)

print("Photo Enhanced Successfully!")



import sys
import os
import re
import time
import subprocess
from subprocess import PIPE
from PIL import Image

def average_hash(image_path, hash_size=8):
    """ Computes the average hash of the given image. """

    # Open the image, resize it and convert it to black & white.
    image = Image.open(image_path)
    image = image.resize((hash_size, hash_size), Image.ANTIALIAS).convert('L')

    # Get the average value of a pixel in the image.
    pixels = list(image.getdata())
    avg = sum(pixels) / len(pixels)

    # Compute the hash based on each pixels value compared to the average.
    bits = "".join(map(lambda pixel: '1' if pixel > avg else '0', pixels))
    hashformat = "0{hashlength}x".format(hashlength=hash_size * 2)
    return int(bits, 2).__format__(hashformat)

pictureDir = sys.argv[1]
pictureHash = average_hash(pictureDir)
print(pictureHash)
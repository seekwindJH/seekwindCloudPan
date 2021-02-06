import hashlib

_strength = 10

# encrypt password
def encrypt(value: str) -> str:
    lock1 = hashlib.sha512()
    lock2 = hashlib.md5()
    for i in range(_strength):
        lock1.update(value.encode("utf-8"))
        value = lock1.hexdigest()
    lock2.update(lock1.hexdigest().encode("utf-8"))
    return bin(int(lock2.hexdigest(), 16))[2:]

__suffix2type = {
    'doc': 'info',
    'xls': 'success',
    'ppt': 'danger',
    'md': 'secondary',
    'program': 'dark',
    'png': 'primary',
}
__programLanguage__ = [
    'java', 'c', 'cpp', 'cs', 'py',
    'js', 'htm', 'html', 'css', 'vue',
    'm', 'asp', 'jsp', 'vb', 'vbs',
    'php', 'lua', 'kt'
]
__pictureFormat__ = [
    'png', 'bmp', 'jpg', 'jpeg',
    'gif', 'dib', 'jpe', 'jfif',
    'tif', 'tiff', 'heic'
]
__textFormat__ = [
    'txt', 'dat', 'md', 'markdown'
]

basePath = "/root/.cloudpan/upload/"

def __suffix2type__(suffix: str):
    if suffix.startswith('do') or suffix == 'rtf':
        return __suffix2type['doc']
    elif suffix.startswith('xl') or suffix == 'csv':
        return __suffix2type['xls']
    elif suffix.startswith('pp') or suffix.startswith('pot') or suffix == 'pdf':
        return __suffix2type['ppt']
    elif suffix in __textFormat__:
        return __suffix2type['md']
    elif suffix in __programLanguage__:
        return __suffix2type['program']
    elif suffix in __pictureFormat__:
        return __suffix2type['png']
    else:
        return 'default'

class File:
    def __init__(self, name, savedate, size):
        self.name = name
        self.savedate = savedate
        self.size = size
        self.suffix = self.name.split('.')[-1]
        self.type = __suffix2type__(self.suffix)

if __name__ == "__main__" :
    print(encrypt('seekwind'))

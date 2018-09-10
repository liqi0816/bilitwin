import json
import numpy as np


class Log():
    def __init__(self, prefix='>> ', depth=1):
        self.prefix = prefix
        self.depth = depth

    def push(self):
        self.depth += 1

    def pop(self):
        self.depth -= 1

    def log(self, message):
        print(self.prefix * self.depth + message)


class NumpyEncoder(json.JSONEncoder):
    # pylint: disable=E0202
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

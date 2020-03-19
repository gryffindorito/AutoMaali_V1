from pyHS100 import Discover
from pyHS100 import SmartPlug, SmartBulb
from pprint import pformat as pf

for dev in Discover.discover().values():
    print(dev)
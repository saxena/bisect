import re

def BisectBT(nodes, text):
    n,i = (nodes['n0'], 0)
    while True:
        if re.search(text,n.regex):
            i = (2*i)+1
        else:
            i = (2*i)+2
        newn = nodes[''.join(('n',str(i)))]
        if newn in nodes and newn.regex:
            n = newn
        else:
            break
    return n

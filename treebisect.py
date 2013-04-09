import re

def BisectBT(nodes, text):
    i = 0
    nodes = nodes['nodes']
    n = nodes['n0']
    #print n['regex']
    #print text
    while unicode('regex') in n:
        if re.search(n['regex'], unicode(text)):
            i = (2*i)+1
        else:
            i = (2*i)+2
        newn = unicode(''.join(('n',str(i))))
        #print newn
        if newn in nodes:
            n = nodes[newn]
        else:
            break
    return n

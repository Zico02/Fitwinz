from pathlib import Path
import re
p=Path(r"c:/Users/DELL/IdeaProjects/Fitwinz_Official_Website/dist/assets/index-custom.js")
s=p.read_text(encoding='utf-8',errors='ignore')
original='c.jsxs("main",{"code-path":"src/App.tsx:188:7",children:[c.jsx(w1,{"code-path":"src/App.tsx:189:9"}),c.jsx(jh,{"code-path":"src/App.tsx:190:9",title:"DURABLE KIT FOR PUSH, PULL & LEG DAYS",label:"MENS",products:J1}),c.jsx(R1,{"code-path":"src/App.tsx:195:9"}),c.jsx(jh,{"code-path":"src/App.tsx:196:9",title:"NEW IN: COOL BROWN",label:"WOMENS",products:W1}),c.jsx(_1,{"code-path":"src/App.tsx:201:9"}),c.jsx(L1,{"code-path":"src/App.tsx:202:9"}),c.jsx(k1,{"code-path":"src/App.tsx:203:9"})]}),c.jsx(X1,{"code-path":"src/App.tsx:205:7"})'
s2=re.sub(r'c\.jsxs\("main",\{"code-path":"src/App\.tsx:188:7".*?c\.jsx\(X1,\{"code-path":"src/App\.tsx:205:7"\}\)', original, s, count=1, flags=re.S)
if s2==s:
    print('main block not replaced')
else:
    p.write_text(s2,encoding='utf-8')
    print('main block restored')

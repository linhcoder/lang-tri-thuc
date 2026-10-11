"""Clean the generated atlas and align directions, with explicit user authorization.

The source remains untouched. Supply a generated input and a new output filename.
"""
import argparse,json
from collections import deque
from pathlib import Path
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('source',type=Path)
parser.add_argument('output',type=Path)
args=parser.parse_args()
if args.source.resolve()==args.output.resolve():
    parser.error('Keep the generated source unchanged')
image=Image.open(args.source).convert('RGBA')
data=list(image.getdata())
removed=0
for i,(r,g,b,a) in enumerate(data):
    # Ignore invisible alpha noise and artificial pure-red chroma contamination.
    # Reds in clothing/fruit have natural nonzero green/blue and remain intact.
    if 0<a<=3 or a and r>240 and g<15 and b<15:
        data[i]=(0,0,0,0);removed+=1
image.putdata(data)
cuts=[0,160,318,478,640,786,945,1098,1254]
atlas=Image.new('RGBA',(2048,2048),(0,0,0,0))
summary=[]
for row in range(8):
    top=round(cuts[row]/1254*image.height);bottom=round(cuts[row+1]/1254*image.height)
    strip=image.crop((0,top,image.width,bottom))
    mask=bytes(strip.getchannel('A').point(lambda a:255 if a>24 else 0).getdata())
    seen=bytearray(len(mask));groups=[[] for _ in range(8)]
    for index,alpha in enumerate(mask):
        if not alpha or seen[index]:continue
        queue=deque([index]);seen[index]=1;count=0;left=image.width;right=0;up=strip.height;down=0
        while queue:
            current=queue.popleft();x=current%image.width;y=current//image.width;count+=1
            left=min(left,x);right=max(right,x);up=min(up,y);down=max(down,y)
            for nx,ny in [(x+dx,y+dy) for dx in [-1,0,1] for dy in [-1,0,1] if dx or dy]:
                if 0<=nx<image.width and 0<=ny<strip.height:
                    neighbor=ny*image.width+nx
                    if mask[neighbor] and not seen[neighbor]:seen[neighbor]=1;queue.append(neighbor)
        if count>80:
            column=min(7,max(0,int((left+right)/2/(image.width/8))))
            groups[column].append((left,up,right+1,down+1))
    cells=[]
    for column in range(8):
        bounds=groups[column]
        if not bounds:
            raise ValueError(f'Empty cell {row},{column}')
        merged=(min(b[0] for b in bounds),min(b[1] for b in bounds),max(b[2] for b in bounds),max(b[3] for b in bounds))
        cells.append(strip.crop(merged))
    scale=min(224/max(cell.width for cell in cells),224/max(cell.height for cell in cells))
    for column,cell in enumerate(cells):
        cell=cell.resize((max(1,round(cell.width*scale)),max(1,round(cell.height*scale))),Image.Resampling.LANCZOS)
        atlas.alpha_composite(cell,(column*256+(256-cell.width)//2,row*256+240-cell.height))
    summary.append({'row':row,'scale':round(scale,4),'directions':8})
args.output.parent.mkdir(parents=True,exist_ok=True)
atlas.save(args.output)
print(json.dumps({'output':str(args.output),'size':atlas.size,'removedFringePixels':removed,'rows':summary},indent=2))

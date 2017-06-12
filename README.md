# ivis
use:
npm update
npm start


Every HBPoint in the euclidean represented poincare disk is a complex number (x + iy) with restriction |p| < 1

To transform a point in HB, we need the moebius transformation f(z) = za+b / conj(b)z + conj(a) (HBPoint.specialTrans)
a and b (in hvs called alpha and beta, calculated in HBGeometryEngine.calculateAlphaBeta) are calulated by the difference betwenn start and endpoint of the mouse movement, starting with the root node.


The initial set is done by assuming, the parent node lies in 0, 0, then a simple sin, cos is done to find the relative position to the parent and then a moebius transofrmation is applied. (HBGeometryEngine.layoutHBNode)



- make pdf: hat bei mir errors, pdf schaut aber ok aus
- make clean: spammts ma mei repo ned zua

- n is immer eine Node
- d wie immer bei d3
- e is immer ein event arg. es gibt ja kein error handling

todos:
- plex basics
- wedge layout
- coole dataloader

- click, transforamtion interface refactoring
- init refactoring
- cache reaftoring
- multiple foci








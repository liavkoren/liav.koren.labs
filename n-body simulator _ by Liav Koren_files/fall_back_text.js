var fall_back_text = " <p>This is an experimental, n-body simulator, running in WebGL. This would not have been possible\
without the excellent <a href = 'http://threejs.org/' target='_blank'>three.js</a> framework, as well as the \
excellent <a href= 'http://www.artcompsci.org/' target='_blank'>Art of Computational Science/Maya Open Lab</a> \
resource by Piet Hut and Jun Makino. While incomplete and, apparently inactive, the Maya Open Lab is an great \
introduction to astronomical simulation and the nuances of numerical simulation. </p> \
\
<p> The <a href='http://en.wikipedia.org/wiki/N-body_problem' target='_blank'>n-body problem</a> dates to the first work on gravity done by Newton. \
Two bodies moving under the influence of gravity have a small and well-understood set of behaviors. For three bodies, \
analytic solutions exist for special cases only. [Technically, a general analytic solution is available with infinite Tayler series, but this \
has obvious practical challenges. And, of course, relativistic n-body is significantly more complex.] \
Special case analytic solutions to the three body problem have been discovered over the decades \
(several of them by major figures of 18/19th century math), as well as most recently by \
<a href= 'http://suki.ipb.ac.rs/3body/' target='_blank'> Milovan Šuvakov and Veljko Dmitrašinović</a>.\
\
<p> Currently this simulation models bodies as point masses, which do not collide and uses a leap-frog integration method to calculate motion. \
Leap-frog is time-reversible, but only second-order accurate. Numerical softening has recently been implimented. Implimenting \
a runga-kutta fourth-order integrator is also part of the dev-path, however currently I am still focused on developing several core \
interface features. </p>\
\
<p>This project is under very active development, as of the July 2013. It has been tested to work in Chrome and Firefox under \
 Win 7. Chrome current provides the best performance. Some features do not work in all versions of Firefox, and some features are \
 still being debugged. WebGL is currently not supported by IE, although it is expected in IE11. \
\
<p>This is a personal project by <a href='http://www.liavkoren.org' target='_blank'>Liav Koren</a>. I am a Toronto based designer, technologist and researcher.\
I have been passionate about space, physics, generative geometry and computational design for a long time. All code by me is licensed \
<a href='http://creativecommons.org/'>Creative Commons</a>, <em>Attribution-NonCommercial-ShareAlike 3.0 Unported</em>. The full code base will be pushed to Git Hub in the near future."

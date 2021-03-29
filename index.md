# Bio
I'm a Toronto-based programmer, with a background in design. I've been doing a mix of backend and full-stack problem solving for over seven years now. I'm an aspiring rationalist, effective altruist, saxophonist, contact-improv dancer and an experience cat annoyer. Pronouns: he/they/hey-you.

# Projects I've been working on

## Implementing Reinforcement Learning papers
In 2017 and 2018 I spent some time studying ML and reinforcement learning. These ipython notebooks document some of this work in a literate-programming style. The goal was to try and write clear, simple implementations, woven together with relevant insights, explorations and training artifacts.
1. [A literate programming exploration of DeepMind's DeepQLearning original paper and some extensions](2018-06-DQN-Part1.html). This notebook documents my initial steps implementing the DQN agent as well the Double DQN extension and discusses some of the underlying theory.
1. [DQN with Prioritized Experience Replay](2018-07-DQN-2_PER.html). Prioritized Experience replay is a DQN extension based on the idea that some of the transitions a reinforcement learning agent sees are more valuable than others. 
1. [Distributional DQN](2018-08-DQN-3_Distributional.html). Distributional DQN agents are attempting to learn the underlying distribution that outcomes are drawn from.

## Interactive N-Body Physics simulation
1. I've also implemented a [numerical simulation](n-body-sim.html) of the [gravitational n-body problem](https://en.wikipedia.org/wiki/N-body_problem). You can use the mouse to drag, pan and zoom the camera, and also click on the "stars" to pin the camera to one of them.

This was inspired by Piet Hut and Jun Makino's [Moving Stars Around](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.600.955&rep=rep1&type=pdf) open textbook which teaches the basics of numerical integration. One thing Hut and Makino *aren't* overly concerned with is making cool visualizations. I wanted to be able to fly around in the system and watch it evolve. This 3d simulation uses three.js to do that.
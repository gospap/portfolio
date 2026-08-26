+++
title = "Why do radar antennas still need to spin?"
description = 'Traditional radar antennas spin primarily to determine the direction of a target and to concentrate energy for greater range and sensitivity. Because standard directional antennas only receive reflections from the specific direction they are pointing, rotation allows a single antenna to scan a full 360-degree horizon. But is it the only way?'
date = 2026-08-20
[taxonomies]
tags = ["Wireless Communications", "Antennas"]
[extra]
katex = true
+++

## The traditional way of scanning the surface

We have all seen, on top of cruise and bus ships, some spinning elements that look like a piece of plastic that rotates. Since we all watch movies, we connected this element with the radar based only on its shape and on the image of the casual green spinning radar screen, besides hearing about it. This is a directional antenna that has a fixed directivity. How does directivity work on those kinds of antennas, though?

## How will we change the directivity without spinning the antenna?

There are some cases where we can't spin the antenna. Small cube satellites don't have the capacity to add external power thrusts because of the lack of space, so they use the law of (angular momentum) inside them to make it rotate on its own. For some reasons, we can't rotate an antenna either.

Among many types of antennas, there is one called the linear particle antenna, and its characteristic is that it is made of linearly placed particles of the same type. A known one is the Hertz Bipolar. Now that we can put many elements together to create an antenna, all of those, when supplied with current, create an electromagnetic field around them, pulsing waves towards a direction. But the directivity of the final antenna won't have its max value unless we design it correctly.

The condition that puts the maximum of the array factor where we want it is:

$$\psi = kd\cos\theta + \delta = 0$$

where $k = 2\pi/\lambda$ is the wavenumber, $d$ is the distance between the particles, $\theta$ is the angle measured off the axis of the array, and $\delta$ is the progressive phase shift between two neighbouring elements.

So the linear particle antenna is a generic category of antennas that includes many other sub types of them. The phased array now, is a subcategory of the linear particle one, but we can point the directivity of it between 0 and 180 degrees without rotating it an inch. And we achieve that by adjusting the parameters of the equation ($d$ and $\theta_0$) accordingly. For example, if the distance between the particles is $d = \lambda/4$ and we want maximum directivity at $\theta_0 = 60^\circ$, then we have to supply the particles, in succession, with a phase difference of $\delta = -45^\circ$.

<figure class="photo">
<img class="no-hover" src="/media/image1.png" alt="A three-dimensional radiation pattern shaped like a lopsided doughnut, next to a polar plot of relative power in dB down whose main lobes sit at theta nought equals 60 degrees on either side of the axis" loading="lazy" />
<figcaption>The same pattern in space and on a polar plot: the main lobes land at $\theta_0 = 60^\circ$, which is what the equation was solved for.</figcaption>
</figure>

By rotating electronically the phase difference between the particles, the max lobe of the linear particle antenna is rotating, sweeping all the directions in space from 0 to 180 degrees.

<figure class="photo">
<img class="no-hover" src="/media/antenna2.png" alt="A phased array feeding network: one input splits into five branches, each through a phase shifter and an attenuator, feeding five half-wavelength elements, with the resulting steered lobe drawn beside them" loading="lazy" />
<figcaption>The feeding network that does it: a phase shifter on every branch of five $\lambda/2$ elements, and the lobe it steers.</figcaption>
</figure>

By solving this equation, we can find out the current phase that each particle needs.

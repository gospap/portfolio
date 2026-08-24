+++
title = "Why we use TLS and not SSL anymore"
description = 'Every version of this protocol exists because the previous one broke in public. The story is less about cryptography than about what the people between you and the server were doing while nobody was encrypting anything.'
date = 2026-08-20
[taxonomies]
tags = ["Findoutologist Moment", "Web Security", "TLS"]
+++

The web is a complicated place to ship anything into. Putting a product in front of real users means thinking about edge cases, about layers of security, and about what you do on the day your data ends up somewhere it should not be. None of that was true at the start. The web of the early 1990s was close to plain text moving between two machines that trusted each other by default, and a page of text did not feel like something worth protecting.

Then money arrived, and with it the first attempt to wrap the whole thing in cryptography. Netscape Communications built SSL 1.0 and never shipped it, because it was broken before it left the building. SSL 2.0 shipped in 1995. SSL 3.0 followed in 1996, a full redesign rather than a patch, and it is the version most of the modern web descends from.

It was still Netscape's protocol, though. So Netscape, Microsoft and the other large vendors took it to the Internet Engineering Task Force, and in 1999 the IETF published TLS 1.0. Technically it was SSL 3.0 with changes small enough that people argued about whether the new name was justified. Politically it was the entire point: the protocol carrying every login on the internet stopped being one company's property and became an open standard.

## POODLE and the downgrade dance

SSL 3.0 did not disappear in 1999. It stayed around for fifteen years as the polite fallback for anything old, and that is exactly what killed it. In October 2014 researchers published POODLE, short for Padding Oracle On Downgraded Legacy Encryption.

The flaw is in how SSL 3.0 pads data in Cipher Block Chaining mode. The specification never says what the padding bytes should contain, so the receiver has no way to verify them. An attacker who can sit in the middle of the connection and make the browser replay the same request thousands of times can watch whether the server accepts or rejects each attempt, and use that single bit of feedback to recover the plaintext one byte at a time. A session cookie is short enough to fall out in minutes.

The clever part is getting a modern browser and a modern server to speak SSL 3.0 at all, because left alone they never would. So the attacker breaks the handshake instead. Every attempt at a good connection is made to fail, and browsers of that era, trying to be compatible with elderly servers, retried one notch lower each time until they landed on SSL 3.0. Sabotage the negotiation and you get to pick the protocol. That is what finally ended SSL 3.0 for good.

## The end of an era is the birth of a greater one

TLS was the version that solved the problem. Vendors collaborated on it, no single company owned it, and it kept improving. But the interesting part of the story is not the protocol. It is what the people sitting between you and the server were doing during the years when so much traffic was still travelling in the clear.

## The header you could not delete

Delete your cookies, open a private window, install every tracker blocker you can find, and an advertiser could still recognise you with complete certainty. In 2014 researchers worked out why.

The answer was that none of it happened on your machine. When a subscriber visited an unencrypted site, Verizon's own network added a header to the request on its way out:

```http
GET /api/v1/cat/42 HTTP/1.1
Host: example.company
X-UIDH: 4b6fe7sdf4f51b0d7f...
```

X-UIDH, the Unique Identifier Header, was a stable identifier for each subscriber, readable by any site or ad network the subscriber visited. Because it was attached after the packet had left the device, nothing on the device could take it off. Not a browser setting, not an extension, not a private window. Verizon had been doing it since roughly 2012. The FCC fined the company $1.35 million in 2016 and the injection stopped.

TLS would have made the whole scheme impossible. An encrypted request is opaque on the wire, and you cannot insert a header into a stream you cannot read or reassemble. All the network would have seen was noise.

## Popup ads from your own provider

Header tracking was the quiet version. In 2016 Comcast customers started seeing Comcast branded notices floating on top of ordinary web pages that had nothing to do with Comcast. The mechanism was the same position on the wire used more aggressively: the network injected JavaScript into unencrypted HTML as it passed through. The injected payload was reported at over a thousand lines of code.

Asked about it, Comcast explained that the notices only reached customers who had already ignored several email warnings about their data allowance. Comforting.

## What TLS actually bought

Once TLS became the default instead of a checkbox, anyone who bothered to capture a request got ciphertext and nothing else. Three properties come with that. Confidentiality, so nobody in the middle can read the traffic. Integrity, so nobody in the middle can change it. Authenticity, so the server on the other end is the one it claims to be.

Confidentiality is the one everyone talks about. The Verizon and Comcast stories are both about integrity, and that is the property that quietly took away an entire category of things a network operator used to be able to do to you.

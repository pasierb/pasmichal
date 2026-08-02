---
title: "Dart: late + final = easy and safe caching"
description: "How to use Dart's late and final keywords together for clean and safe caching with compile-time guarantees."
pubDate: "2023-01-08"
originalUrl: "https://dev.to/pasmichal/dart-late-final-easy-and-safe-caching-11ib"
source: "dev.to"
tags: ["dart", "flutter", "programming"]
---

Let's say You have a `Person` class and You want to expose `netWorth` field.
There is a backend API to fetch it but it's pretty expensive.
Backend needs to call all associated bank APIs, convert currencies, calculate real estate values, etc.
Here's how to use new `late` variables feature to implement easy and safe caching.

## Naive approach

We could start with super simple approach, i.e. fetch the value every time we use it.

```dart
class Person {
  Future<num> netWorth() => _fetchNetWorth();
}

// await person.netWorth()
```

## Cache result

Instead of calling `_fetchNetWorth` every time we could call it only once and cache the results.

```dart
class Person {
  Future<num>? _fetchNetWorthFuture;

  Future<num> netWorth() {
    _fetchNetWorthFuture ??= _fetchNetWorth();

    return _fetchNetWorthFuture;
  }
}

// await person.netWorth()
```

There is an open question hanging in the air: why `netWorth` is `Future<num>` and not simply `num`?
We could have some initialization function that could resolve the future, right?

I'm not a fan of such initialization functions because it creates unnecessary dependency that can quickly become unmanageable.

What if we have another field in the class that has to be fetched? We throw it in init function!

What if we need only one not the other? Should we have two init functions? Or maybe have some logic what to initialize?

Futures are cheap and I like the explicit contract that we expose. Consumer of our class knows from the get-go that this value has some cost.

Ok, now we cached the result (or rather Future of the result) so we don't make the expensive call again.
There is not much more we can do in terms of resource optimisation, but we can optimise the code a bit - we can get rid of the intermediate `_fetchNetWorthFuture` variable.

## late + final

With introduction of sound null-safety we got access to [`late`](https://dart.dev/null-safety/understanding-null-safety#late-variables) keyword. `late` allows us to take responsibility of nullness of the value. It's like telling compiler "trust me, the value will be there when I use it".

> The late modifier has some other special powers too. It may seem paradoxical, but you can use late on a field that has an initializer:
>
> — [Understanding null safety: lazy initialization](https://dart.dev/null-safety/understanding-null-safety#lazy-initialization)

Possibility to have initializer on `late` variables allows us to get rid of intermediate `_fetchNetWorthFuture` variable.
Slapping `final` gives us compile time guarantee that the variable will be assigned only once.

```dart
class Person {
  // Potentially expensive calculation.
  late final netWorth = _fetchNetWorth();
}

// await person.netWorth
```

/* YourTechBuddy: all 23 Gang of Four design patterns as interactive UML.
   Each pattern = boxes laid out in rows + edges routed automatically + runnable Python.
   Used by the home page explorer and /patterns/. */
(function () {
  const P = [];
  const add = (p) => P.push(p);
  const I = (name, ops, info, extra = {}) => ({ name, stereo: 'interface', iface: true, attrs: [], ops, info, ...extra });
  const C = (name, attrs, ops, info, extra = {}) => ({ name, attrs, ops, info, ...extra });
  const A = (name, attrs, ops, info) => ({ name, stereo: 'abstract', attrs, ops, info });

  /* ======================= Creational ======================= */
  add({ key: 'singleton', name: 'Singleton', cat: 'Creational',
    intent: 'Exactly one instance of a class, with one global way to reach it.',
    when: 'Shared resources like a logger, config or connection pool where two copies would be a bug.',
    tip: 'One shared instance, created lazily on first use.',
    rows: [{ ids: ['log'] }, { ids: ['order', 'pay'], gap: 40 }],
    boxes: {
      log: C('Logger', ['- instance: Logger  {static}', '- lines: List'], ['- Logger()', '+ getInstance(): Logger', '+ log(msg): void'], 'There is exactly one Logger. The constructor is private, so everyone has to call getInstance().'),
      order: C('OrderService', [], ['+ place(): void'], 'Calls Logger.getInstance(), so it gets the shared object.'),
      pay: C('PaymentService', [], ['+ pay(): void'], 'Also calls getInstance() and gets the very same Logger.'),
    },
    edges: [['order', 'log', 'dep', 'getInstance()'], ['pay', 'log', 'dep']],
    code: `class Logger:
    _instance = None

    def __init__(self):
        if Logger._instance is not None:
            raise RuntimeError("Use Logger.get_instance()")
        self.lines = []

    @classmethod
    def get_instance(cls) -> "Logger":
        if cls._instance is None:
            print("Creating the one and only Logger")
            cls._instance = Logger()
        return cls._instance

    def log(self, msg: str):
        self.lines.append(msg)
        print(f"[{len(self.lines)}] {msg}")

class OrderService:
    def place(self): Logger.get_instance().log("order placed")

class PaymentService:
    def pay(self): Logger.get_instance().log("payment done")

OrderService().place()
PaymentService().pay()
print("Same object?", Logger.get_instance() is Logger.get_instance())
` });

  add({ key: 'factory', name: 'Factory Method', cat: 'Creational', aliases: ['factory'],
    intent: 'Let subclasses decide which concrete object to create.',
    when: 'The core flow is the same but the object it works with varies, e.g. road vs sea delivery.',
    tip: 'plan() stays the same; each subclass picks what make() returns.',
    rows: [{ ids: ['log', 'tr'], gap: 90 }, { ids: ['road', 'sea', 'truck', 'ship'], gap: 14 }],
    boxes: {
      log: A('Logistics', [], ['+ plan(): void', '+ make(): Transport'], 'The creator. plan() runs the delivery flow and calls make() to get a vehicle, without knowing which one.'),
      tr: I('Transport', ['+ deliver(): void'], 'What every product looks like. plan() only talks to this.'),
      road: C('RoadLogistics', [], ['+ make()'], 'Overrides make() to return a Truck.'),
      sea: C('SeaLogistics', [], ['+ make()'], 'Overrides make() to return a Ship. Adding Air means one new pair of classes, no edits.'),
      truck: C('Truck', [], ['+ deliver()'], 'A concrete product.'),
      ship: C('Ship', [], ['+ deliver()'], 'Another concrete product.'),
    },
    edges: [['log', 'tr', 'dep', 'creates'], ['road', 'log', 'inherit'], ['sea', 'log', 'inherit'], ['truck', 'tr', 'realize'], ['ship', 'tr', 'realize']],
    code: `from abc import ABC, abstractmethod

class Transport(ABC):
    @abstractmethod
    def deliver(self): ...

class Truck(Transport):
    def deliver(self): print("Delivering by road in a truck")

class Ship(Transport):
    def deliver(self): print("Delivering by sea in a container ship")

class Logistics(ABC):
    @abstractmethod
    def make(self) -> Transport: ...       # the factory method

    def plan(self):
        print(f"{type(self).__name__}: planning delivery")
        self.make().deliver()

class RoadLogistics(Logistics):
    def make(self): return Truck()

class SeaLogistics(Logistics):
    def make(self): return Ship()

for company in [RoadLogistics(), SeaLogistics()]:
    company.plan()
` });

  add({ key: 'abstract-factory', name: 'Abstract Factory', cat: 'Creational',
    intent: 'Create families of related objects without naming their concrete classes.',
    when: 'Things must match each other: light theme widgets, or AWS vs GCP clients.',
    tip: 'Swap the whole family by swapping one factory.',
    rows: [{ ids: ['app', 'uif'], gap: 90 }, { ids: ['light', 'dark'], gap: 30, under: 'uif' }],
    boxes: {
      app: C('App', ['- ui: UIFactory'], ['+ render(): void'], 'Builds its screen through the factory, so it never mixes a light button with a dark checkbox.'),
      uif: I('UIFactory', ['+ button(): Button', '+ checkbox(): Checkbox'], 'One method per product in the family.'),
      light: C('LightFactory', [], ['+ button()', '+ checkbox()'], 'Makes the light-themed family.'),
      dark: C('DarkFactory', [], ['+ button()', '+ checkbox()'], 'Makes the dark-themed family. Pick it once at startup.'),
    },
    edges: [['app', 'uif', 'assoc', 'uses'], ['light', 'uif', 'realize'], ['dark', 'uif', 'realize']],
    code: `from abc import ABC, abstractmethod

class UIFactory(ABC):
    @abstractmethod
    def button(self) -> str: ...
    @abstractmethod
    def checkbox(self) -> str: ...

class LightFactory(UIFactory):
    def button(self): return "[ white button ]"
    def checkbox(self): return "[x] black tick on white"

class DarkFactory(UIFactory):
    def button(self): return "[ black button ]"
    def checkbox(self): return "[x] white tick on black"

class App:
    def __init__(self, ui: UIFactory):
        self.ui = ui
    def render(self):
        print(self.ui.button(), "|", self.ui.checkbox())

for theme in [LightFactory(), DarkFactory()]:
    print(type(theme).__name__ + ":", end=" ")
    App(theme).render()
` });

  add({ key: 'builder', name: 'Builder', cat: 'Creational',
    intent: 'Build a complex object step by step instead of one giant constructor.',
    when: 'Many optional parts: HTTP requests, SQL queries, a pizza with toppings.',
    tip: 'Chain the steps you need, then call build().',
    rows: [{ ids: ['client', 'builder'], gap: 80 }, { ids: ['pizza'], under: 'builder' }],
    boxes: {
      client: C('OrderScreen', [], ['+ order(): Pizza'], 'Calls only the steps it needs, in a readable chain.'),
      builder: C('PizzaBuilder', ['- size: str', '- toppings: List'], ['+ size(s): PizzaBuilder', '+ add(t): PizzaBuilder', '+ build(): Pizza'], 'Each step returns the builder itself, so calls chain. build() validates and returns the finished Pizza.'),
      pizza: C('Pizza', ['+ size: str', '+ toppings: List'], ['+ describe(): str'], 'The finished, immutable product.'),
    },
    edges: [['client', 'builder', 'assoc', 'uses'], ['builder', 'pizza', 'dep', 'build()']],
    code: `class Pizza:
    def __init__(self, size, toppings):
        self.size, self.toppings = size, tuple(toppings)
    def describe(self):
        return f"{self.size} pizza with {', '.join(self.toppings) or 'just cheese'}"

class PizzaBuilder:
    def __init__(self):
        self._size, self._toppings = "medium", []
    def size(self, s):
        self._size = s
        return self
    def add(self, topping):
        self._toppings.append(topping)
        return self
    def build(self):
        if len(self._toppings) > 5:
            raise ValueError("Too many toppings")
        return Pizza(self._size, self._toppings)

p = PizzaBuilder().size("large").add("paneer").add("onion").add("capsicum").build()
print(p.describe())
print(PizzaBuilder().build().describe())
` });

  add({ key: 'prototype', name: 'Prototype', cat: 'Creational',
    intent: 'Create new objects by copying an existing one.',
    when: 'Objects are costly to set up, or you keep a few presets to clone and tweak.',
    tip: 'Ask an object to clone itself; no need to know its class.',
    rows: [{ ids: ['reg', 'shape'], gap: 90 }, { ids: ['circle', 'rect'], gap: 30, under: 'shape' }],
    boxes: {
      reg: C('ShapeRegistry', ['- presets: Dict'], ['+ get(key): Shape'], 'Keeps ready-made shapes and hands out clones, never the originals.'),
      shape: I('Shape', ['+ clone(): Shape'], 'Every shape knows how to copy itself.'),
      circle: C('Circle', ['- radius'], ['+ clone()'], 'Copies its own fields.'),
      rect: C('Rectangle', ['- w, h'], ['+ clone()'], 'Copies its own fields. The registry never needs to know.'),
    },
    edges: [['reg', 'shape', 'assoc', 'clones'], ['circle', 'shape', 'realize'], ['rect', 'shape', 'realize']],
    code: `import copy

class Shape:
    def clone(self):
        return copy.deepcopy(self)

class Circle(Shape):
    def __init__(self, radius, color):
        self.radius, self.color = radius, color
    def __repr__(self): return f"Circle(r={self.radius}, {self.color})"

class Rectangle(Shape):
    def __init__(self, w, h, color):
        self.w, self.h, self.color = w, h, color
    def __repr__(self): return f"Rectangle({self.w}x{self.h}, {self.color})"

class ShapeRegistry:
    def __init__(self):
        self.presets = {"dot": Circle(1, "black"), "card": Rectangle(85, 54, "white")}
    def get(self, key):
        return self.presets[key].clone()

reg = ShapeRegistry()
a, b = reg.get("dot"), reg.get("dot")
b.color = "red"
print(a, b)
print("Original untouched:", reg.presets["dot"])
` });

  /* ======================= Structural ======================= */
  add({ key: 'adapter', name: 'Adapter', cat: 'Structural',
    intent: 'Make an incompatible class fit the interface your code expects.',
    when: 'Plugging in a third-party SDK or legacy class without changing your code.',
    tip: 'Your code talks to PaymentGateway; the adapter translates.',
    rows: [{ ids: ['checkout', 'gw'], gap: 80 }, { ids: ['adapter', 'sdk'], gap: 80, under: 'gw' }],
    boxes: {
      checkout: C('CheckoutService', [], ['+ pay(amount): void'], 'Only knows PaymentGateway. It has no idea Razorpay exists.'),
      gw: I('PaymentGateway', ['+ charge(rupees): bool'], 'The interface your code was written against.'),
      adapter: C('RazorpayAdapter', ['- sdk: RazorpaySDK'], ['+ charge(rupees)'], 'Implements PaymentGateway and translates each call into what the SDK wants (paise, different method names).'),
      sdk: C('RazorpaySDK', [], ['+ create_payment(paise)'], 'Third-party code you cannot change.'),
    },
    edges: [['checkout', 'gw', 'assoc', 'uses'], ['adapter', 'gw', 'realize'], ['adapter', 'sdk', 'assoc', 'wraps']],
    code: `class PaymentGateway:
    def charge(self, rupees: int) -> bool: raise NotImplementedError

class RazorpaySDK:                       # third-party, can't change it
    def create_payment(self, paise: int, currency: str):
        print(f"Razorpay: charging {paise} paise in {currency}")
        return {"status": "captured"}

class RazorpayAdapter(PaymentGateway):
    def __init__(self, sdk: RazorpaySDK):
        self.sdk = sdk
    def charge(self, rupees):
        res = self.sdk.create_payment(rupees * 100, "INR")
        return res["status"] == "captured"

class CheckoutService:
    def __init__(self, gateway: PaymentGateway):
        self.gateway = gateway
    def pay(self, amount):
        ok = self.gateway.charge(amount)
        print("Payment", "successful" if ok else "failed")

CheckoutService(RazorpayAdapter(RazorpaySDK())).pay(499)
` });

  add({ key: 'bridge', name: 'Bridge', cat: 'Structural',
    intent: 'Split one big hierarchy into two that can vary independently.',
    when: 'Two dimensions of change, e.g. kinds of notification x delivery channels.',
    tip: 'Notification types and senders grow separately: no class explosion.',
    rows: [{ ids: ['notif', 'sender'], gap: 90 }, { ids: ['alert', 'promo', 'email', 'sms'], gap: 14 }],
    boxes: {
      notif: A('Notification', ['- sender: Sender'], ['+ send(msg): void'], 'The abstraction. It holds a Sender and delegates the actual delivery to it.'),
      sender: I('Sender', ['+ deliver(text): void'], 'The implementation side of the bridge.'),
      alert: C('Alert', [], ['+ send(msg)'], 'Formats an urgent alert.'),
      promo: C('Promo', [], ['+ send(msg)'], 'Formats a marketing message.'),
      email: C('EmailSender', [], ['+ deliver()'], 'Sends by email.'),
      sms: C('SmsSender', [], ['+ deliver()'], 'Sends by SMS. 2 types x 2 channels = 4 classes, not 4 subclasses each.'),
    },
    edges: [['notif', 'sender', 'comp', 'has a'], ['alert', 'notif', 'inherit'], ['promo', 'notif', 'inherit'], ['email', 'sender', 'realize'], ['sms', 'sender', 'realize']],
    code: `class Sender:
    def deliver(self, text): raise NotImplementedError

class EmailSender(Sender):
    def deliver(self, text): print("EMAIL:", text)

class SmsSender(Sender):
    def deliver(self, text): print("SMS:  ", text)

class Notification:
    def __init__(self, sender: Sender):
        self.sender = sender            # the bridge
    def send(self, msg): raise NotImplementedError

class Alert(Notification):
    def send(self, msg): self.sender.deliver(f"[URGENT] {msg.upper()}")

class Promo(Notification):
    def send(self, msg): self.sender.deliver(f"{msg} Use code YTB10")

Alert(SmsSender()).send("server down")
Alert(EmailSender()).send("server down")
Promo(EmailSender()).send("New LLD course is live!")
` });

  add({ key: 'composite', name: 'Composite', cat: 'Structural',
    intent: 'Treat single objects and groups of objects the same way.',
    when: 'Tree structures: folders and files, menus, org charts, UI layouts.',
    tip: 'A Folder holds items, and is an item itself.',
    rows: [{ ids: ['item'] }, { ids: ['file', 'folder'], gap: 50, under: 'item' }],
    boxes: {
      item: I('FileSystemItem', ['+ size(): int', '+ show(indent): void'], 'Both files and folders look like this, so callers never check which one they have.'),
      file: C('File', ['- bytes: int'], ['+ size()'], 'A leaf: returns its own size.'),
      folder: C('Folder', ['- children: List'], ['+ add(item)', '+ size()'], 'Sums its children, which can be files or more folders.'),
    },
    edges: [['file', 'item', 'realize'], ['folder', 'item', 'realize'], ['folder', 'item', 'agg', 'children *', 'right']],
    code: `class FileSystemItem:
    def size(self): raise NotImplementedError
    def show(self, indent=0): raise NotImplementedError

class File(FileSystemItem):
    def __init__(self, name, kb): self.name, self.kb = name, kb
    def size(self): return self.kb
    def show(self, indent=0): print("  " * indent + f"{self.name} ({self.kb} KB)")

class Folder(FileSystemItem):
    def __init__(self, name): self.name, self.children = name, []
    def add(self, item):
        self.children.append(item)
        return self
    def size(self): return sum(c.size() for c in self.children)
    def show(self, indent=0):
        print("  " * indent + f"{self.name}/ ({self.size()} KB)")
        for c in self.children: c.show(indent + 1)

root = Folder("course").add(File("intro.mp4", 900)).add(
    Folder("patterns").add(File("strategy.py", 3)).add(File("observer.py", 4)))
root.show()
` });

  add({ key: 'decorator', name: 'Decorator', cat: 'Structural',
    intent: 'Add behaviour to an object by wrapping it, without changing its class.',
    when: 'Stackable extras: milk and sugar on coffee, logging or caching around a service.',
    tip: 'Wrappers look like the thing they wrap, so you can stack them.',
    rows: [{ ids: ['coffee'] }, { ids: ['espresso', 'addon'], gap: 40, under: 'coffee' }, { ids: ['milk', 'sugar'], gap: 24, under: 'addon' }],
    boxes: {
      coffee: I('Coffee', ['+ cost(): int', '+ name(): str'], 'What everyone works with, plain or decorated.'),
      espresso: C('Espresso', [], ['+ cost()'], 'The base object being decorated.'),
      addon: A('AddOn', ['- inner: Coffee'], ['+ cost()'], 'Is a Coffee and has a Coffee. It forwards to inner and adds its bit.'),
      milk: C('Milk', [], ['+ cost()'], 'Adds ₹20 on top of whatever it wraps.'),
      sugar: C('Sugar', [], ['+ cost()'], 'Adds ₹5. Wrap twice for double sugar.'),
    },
    edges: [['espresso', 'coffee', 'realize'], ['addon', 'coffee', 'realize'], ['addon', 'coffee', 'agg', 'wraps', 'right'], ['milk', 'addon', 'inherit'], ['sugar', 'addon', 'inherit']],
    code: `class Coffee:
    def cost(self): raise NotImplementedError
    def name(self): raise NotImplementedError

class Espresso(Coffee):
    def cost(self): return 120
    def name(self): return "Espresso"

class AddOn(Coffee):
    def __init__(self, inner: Coffee): self.inner = inner

class Milk(AddOn):
    def cost(self): return self.inner.cost() + 20
    def name(self): return self.inner.name() + " + milk"

class Sugar(AddOn):
    def cost(self): return self.inner.cost() + 5
    def name(self): return self.inner.name() + " + sugar"

order = Sugar(Sugar(Milk(Espresso())))
print(order.name(), "= Rs", order.cost())
print(Espresso().name(), "= Rs", Espresso().cost())
` });

  add({ key: 'facade', name: 'Facade', cat: 'Structural',
    intent: 'One simple front door to a complicated set of classes.',
    when: 'Callers need one action (place an order) that touches many subsystems.',
    tip: 'The client makes one call; the facade coordinates the rest.',
    rows: [{ ids: ['client', 'facade'], gap: 80 }, { ids: ['inv', 'pay', 'ship'], gap: 20, under: 'facade' }],
    boxes: {
      client: C('MobileApp', [], ['+ buy(item)'], 'Makes one call and knows nothing about the subsystems.'),
      facade: C('OrderFacade', [], ['+ place_order(item, card)'], 'Calls inventory, payment and shipping in the right order and handles failures.'),
      inv: C('Inventory', [], ['+ reserve(item)'], 'A subsystem with its own API.'),
      pay: C('Payments', [], ['+ charge(card)'], 'A subsystem with its own API.'),
      ship: C('Shipping', [], ['+ book(item)'], 'A subsystem with its own API.'),
    },
    edges: [['client', 'facade', 'assoc', 'one call'], ['facade', 'inv', 'dep'], ['facade', 'pay', 'dep'], ['facade', 'ship', 'dep']],
    code: `class Inventory:
    def reserve(self, item): print(f"Inventory: reserved {item}"); return True

class Payments:
    def charge(self, card, amount): print(f"Payments: charged Rs {amount} to {card[-4:]}"); return True

class Shipping:
    def book(self, item): print(f"Shipping: courier booked for {item}"); return "AWB123"

class OrderFacade:
    def __init__(self):
        self.inv, self.pay, self.ship = Inventory(), Payments(), Shipping()
    def place_order(self, item, card, amount):
        if not self.inv.reserve(item): return None
        if not self.pay.charge(card, amount): return None
        return self.ship.book(item)

awb = OrderFacade().place_order("mechanical keyboard", "4111111111114417", 3499)
print("Order placed, tracking id:", awb)
` });

  add({ key: 'flyweight', name: 'Flyweight', cat: 'Structural',
    intent: 'Share the common, heavy part of many objects to save memory.',
    when: 'Huge numbers of similar objects: trees in a game, characters in an editor.',
    tip: 'A million trees, only a handful of TreeType objects.',
    rows: [{ ids: ['forest', 'factory'], gap: 80 }, { ids: ['tree', 'type'], gap: 90, under: 'factory' }],
    boxes: {
      forest: C('Forest', ['- trees: List'], ['+ plant(x, y, kind)'], 'Plants trees by asking the factory for a shared type.'),
      factory: C('TreeFactory', ['- cache: Dict'], ['+ get(kind): TreeType'], 'Returns the cached TreeType if it exists, so each kind is created once.'),
      tree: C('Tree', ['- x, y: int', '- type: TreeType'], ['+ draw()'], 'Tiny object: only its own position plus a pointer to the shared type.'),
      type: C('TreeType', ['- name, color', '- texture'], ['+ draw(x, y)'], 'The heavy, shared part (texture, colour). Never duplicated.'),
    },
    edges: [['forest', 'factory', 'assoc', 'asks'], ['factory', 'type', 'assoc', 'caches'], ['tree', 'type', 'assoc', 'shares']],
    code: `class TreeType:
    def __init__(self, name, color):
        self.name, self.color = name, color
        self.texture = "x" * 10_000          # pretend this is heavy
    def draw(self, x, y): pass

class TreeFactory:
    cache = {}
    @classmethod
    def get(cls, name, color):
        key = (name, color)
        if key not in cls.cache:
            cls.cache[key] = TreeType(name, color)
        return cls.cache[key]

class Tree:
    __slots__ = ("x", "y", "type")
    def __init__(self, x, y, t): self.x, self.y, self.type = x, y, t

import random
forest = [Tree(random.randint(0, 999), random.randint(0, 999),
               TreeFactory.get(*random.choice([("neem", "green"), ("gulmohar", "red"), ("ashoka", "dark green")])))
          for _ in range(100_000)]
print("Trees planted:", len(forest))
print("TreeType objects created:", len(TreeFactory.cache))
` });

  add({ key: 'proxy', name: 'Proxy', cat: 'Structural',
    intent: 'A stand-in that controls access to the real object.',
    when: 'Lazy loading, caching, access checks or rate limits in front of something expensive.',
    tip: 'Same interface as the real thing; it decides when to call it.',
    rows: [{ ids: ['client', 'image'], gap: 80 }, { ids: ['proxy', 'real'], gap: 90, under: 'image' }],
    boxes: {
      client: C('Gallery', [], ['+ open(i)'], 'Treats every image the same, real or proxy.'),
      image: I('Image', ['+ display(): void'], 'Shared by the proxy and the real image.'),
      proxy: C('ImageProxy', ['- real: RealImage'], ['+ display()'], 'Creates the RealImage only when display() is first called, then reuses it.'),
      real: C('RealImage', ['- pixels'], ['+ display()'], 'Expensive: loads the full file from disk in its constructor.'),
    },
    edges: [['client', 'image', 'assoc', 'uses'], ['proxy', 'image', 'realize'], ['real', 'image', 'realize'], ['proxy', 'real', 'assoc', 'lazy']],
    code: `class Image:
    def display(self): raise NotImplementedError

class RealImage(Image):
    def __init__(self, path):
        print(f"  (slow) loading {path} from disk...")
        self.path = path
    def display(self): print(f"  showing {self.path}")

class ImageProxy(Image):
    def __init__(self, path):
        self.path, self.real = path, None
    def display(self):
        if self.real is None:
            self.real = RealImage(self.path)
        self.real.display()

gallery = [ImageProxy(f"photo{i}.jpg") for i in range(1, 4)]
print("Gallery opened, nothing loaded yet")
print("Click photo 2:"); gallery[1].display()
print("Click photo 2 again:"); gallery[1].display()
` });

  /* ======================= Behavioral ======================= */
  add({ key: 'chain', name: 'Chain of Responsibility', cat: 'Behavioral', aliases: ['chain of responsibility'],
    intent: 'Pass a request along a chain of handlers until one deals with it.',
    when: 'Middleware pipelines: auth, rate limit, validation, each able to stop the request.',
    tip: 'Each handler either handles the request or passes it to next.',
    rows: [{ ids: ['client', 'handler'], gap: 80 }, { ids: ['auth', 'rate', 'valid'], gap: 16, under: 'handler' }],
    boxes: {
      client: C('ApiServer', [], ['+ serve(req)'], 'Hands the request to the first handler only.'),
      handler: A('Handler', ['- next: Handler'], ['+ set_next(h): Handler', '+ handle(req)'], 'Holds a link to the next handler. The default handle() just forwards.'),
      auth: C('Auth', [], ['+ handle(req)'], 'Rejects requests without a token, else passes on.'),
      rate: C('RateLimit', [], ['+ handle(req)'], 'Rejects users over their limit, else passes on.'),
      valid: C('Validate', [], ['+ handle(req)'], 'Checks the body. Reorder or add handlers without touching the others.'),
    },
    edges: [['client', 'handler', 'assoc', 'handle()'], ['handler', 'handler', 'loop', 'next'], ['auth', 'handler', 'inherit'], ['rate', 'handler', 'inherit'], ['valid', 'handler', 'inherit']],
    code: `class Handler:
    def __init__(self): self.next = None
    def set_next(self, h):
        self.next = h
        return h
    def handle(self, req):
        return self.next.handle(req) if self.next else "200 OK"

class Auth(Handler):
    def handle(self, req):
        if not req.get("token"): return "401 Unauthorized"
        return super().handle(req)

class RateLimit(Handler):
    def handle(self, req):
        if req.get("calls", 0) > 100: return "429 Too Many Requests"
        return super().handle(req)

class Validate(Handler):
    def handle(self, req):
        if "body" not in req: return "400 Bad Request"
        return super().handle(req)

chain = Auth()
chain.set_next(RateLimit()).set_next(Validate())
for req in [{}, {"token": "t", "calls": 500}, {"token": "t"}, {"token": "t", "body": "{}"}]:
    print(req, "->", chain.handle(req))
` });

  add({ key: 'command', name: 'Command', cat: 'Behavioral',
    intent: 'Turn a request into an object you can queue, log or undo.',
    when: 'Undo/redo, job queues, macros, remote controls.',
    tip: 'The remote stores commands, so undo is just "call undo() on the last one".',
    rows: [{ ids: ['remote', 'cmd'], gap: 80 }, { ids: ['on', 'off'], gap: 30, under: 'cmd' }, { ids: ['light'], under: 'cmd' }],
    boxes: {
      remote: C('Remote', ['- history: List'], ['+ press(cmd)', '+ undo()'], 'The invoker. It runs commands and remembers them, without knowing what they do.'),
      cmd: I('Command', ['+ execute()', '+ undo()'], 'Every action, wrapped as an object.'),
      on: C('LightOn', ['- light'], ['+ execute()'], 'Knows which receiver to call.'),
      off: C('LightOff', ['- light'], ['+ execute()'], 'Its undo() turns the light back on.'),
      light: C('Light', [], ['+ on()', '+ off()'], 'The receiver that does the real work.'),
    },
    edges: [['remote', 'cmd', 'assoc', 'runs'], ['on', 'cmd', 'realize'], ['off', 'cmd', 'realize'], ['on', 'light', 'assoc'], ['off', 'light', 'assoc']],
    code: `class Light:
    def on(self): print("  Light ON")
    def off(self): print("  Light OFF")

class LightOn:
    def __init__(self, light): self.light = light
    def execute(self): self.light.on()
    def undo(self): self.light.off()

class LightOff:
    def __init__(self, light): self.light = light
    def execute(self): self.light.off()
    def undo(self): self.light.on()

class Remote:
    def __init__(self): self.history = []
    def press(self, cmd):
        cmd.execute()
        self.history.append(cmd)
    def undo(self):
        if self.history: self.history.pop().undo()

light, remote = Light(), Remote()
print("press ON");  remote.press(LightOn(light))
print("press OFF"); remote.press(LightOff(light))
print("undo");      remote.undo()
print("undo");      remote.undo()
` });

  add({ key: 'interpreter', name: 'Interpreter', cat: 'Behavioral',
    intent: 'Represent a small language as a tree of objects that can evaluate itself.',
    when: 'Simple rule engines, filters, math expressions, feature-flag conditions.',
    tip: 'Each node knows how to interpret itself; trees nest freely.',
    rows: [{ ids: ['client', 'expr'], gap: 80 }, { ids: ['num', 'add'], gap: 40, under: 'expr' }],
    boxes: {
      client: C('Calculator', [], ['+ run(tree)'], 'Builds an expression tree and calls interpret() on the root.'),
      expr: I('Expression', ['+ interpret(): int'], 'Every node in the grammar.'),
      num: C('Number', ['- value: int'], ['+ interpret()'], 'A leaf: returns its value.'),
      add: C('Add', ['- left, right'], ['+ interpret()'], 'Holds two expressions and adds their results. Add Multiply the same way.'),
    },
    edges: [['client', 'expr', 'assoc', 'evaluates'], ['num', 'expr', 'realize'], ['add', 'expr', 'realize'], ['add', 'expr', 'agg', 'left, right', 'right']],
    code: `class Expression:
    def interpret(self): raise NotImplementedError

class Number(Expression):
    def __init__(self, v): self.v = v
    def interpret(self): return self.v
    def __str__(self): return str(self.v)

class Add(Expression):
    def __init__(self, l, r): self.l, self.r = l, r
    def interpret(self): return self.l.interpret() + self.r.interpret()
    def __str__(self): return f"({self.l} + {self.r})"

class Multiply(Expression):
    def __init__(self, l, r): self.l, self.r = l, r
    def interpret(self): return self.l.interpret() * self.r.interpret()
    def __str__(self): return f"({self.l} * {self.r})"

tree = Add(Number(2), Multiply(Number(3), Add(Number(4), Number(1))))
print(tree, "=", tree.interpret())
` });

  add({ key: 'iterator', name: 'Iterator', cat: 'Behavioral',
    intent: 'Walk through a collection without exposing how it is stored.',
    when: 'Custom collections, paginated APIs, trees you want to loop over simply.',
    tip: 'Callers just ask has_next() / next().',
    rows: [{ ids: ['playlist', 'iter'], gap: 90 }, { ids: ['pli'], under: 'iter' }],
    boxes: {
      playlist: C('Playlist', ['- songs: List'], ['+ iterator(): Iterator'], 'Hands out an iterator; its internal list stays private.'),
      iter: I('Iterator', ['+ has_next(): bool', '+ next(): Song'], 'The only thing callers loop with.'),
      pli: C('ShuffleIterator', ['- order: List', '- index: int'], ['+ has_next()', '+ next()'], 'Knows how to walk the playlist (here, in shuffled order). Add a RepeatIterator without touching Playlist.'),
    },
    edges: [['playlist', 'iter', 'dep', 'creates'], ['pli', 'iter', 'realize'], ['pli', 'playlist', 'assoc', 'walks']],
    code: `import random

class ShuffleIterator:
    def __init__(self, songs):
        self.order = songs[:]
        random.shuffle(self.order)
        self.index = 0
    def has_next(self): return self.index < len(self.order)
    def next(self):
        song = self.order[self.index]
        self.index += 1
        return song
    # make it work with Python's for-loop too
    def __iter__(self): return self
    def __next__(self):
        if not self.has_next(): raise StopIteration
        return self.next()

class Playlist:
    def __init__(self, *songs): self._songs = list(songs)
    def iterator(self): return ShuffleIterator(self._songs)

pl = Playlist("Kesariya", "Tum Hi Ho", "Ilahi", "Kun Faya Kun")
it = pl.iterator()
while it.has_next():
    print("Now playing:", it.next())
` });

  add({ key: 'mediator', name: 'Mediator', cat: 'Behavioral',
    intent: 'Objects talk through one coordinator instead of to each other.',
    when: 'Many objects that would otherwise all reference each other: chat rooms, form fields, air traffic.',
    tip: 'Users only know the room, never each other.',
    rows: [{ ids: ['user', 'med'], gap: 90 }, { ids: ['room'], under: 'med' }],
    boxes: {
      user: C('User', ['- room: Mediator'], ['+ send(msg)', '+ receive(msg)'], 'Sends through the mediator. Adding a user never changes the other users.'),
      med: I('Mediator', ['+ broadcast(msg, sender)'], 'The single point of contact.'),
      room: C('ChatRoom', ['- members: List'], ['+ join(user)', '+ broadcast()'], 'Knows all members and delivers messages to everyone except the sender.'),
    },
    edges: [['user', 'med', 'assoc', 'talks via'], ['room', 'med', 'realize'], ['room', 'user', 'agg', 'members *']],
    code: `class ChatRoom:
    def __init__(self): self.members = []
    def join(self, user):
        self.members.append(user)
        user.room = self
    def broadcast(self, msg, sender):
        for m in self.members:
            if m is not sender:
                m.receive(f"{sender.name}: {msg}")

class User:
    def __init__(self, name): self.name, self.room = name, None
    def send(self, msg): self.room.broadcast(msg, self)
    def receive(self, msg): print(f"  [{self.name}'s screen] {msg}")

room = ChatRoom()
priya, rahul, aman = User("Priya"), User("Rahul"), User("Aman")
for u in (priya, rahul, aman): room.join(u)
priya.send("Anyone done the LLD mock interview?")
rahul.send("Yes, got a Hire!")
` });

  add({ key: 'memento', name: 'Memento', cat: 'Behavioral',
    intent: 'Save and restore an object’s state without exposing its internals.',
    when: 'Undo in editors, checkpoints in games, rollback of a form.',
    tip: 'The editor makes snapshots; history just stores them.',
    rows: [{ ids: ['editor', 'history'], gap: 120 }, { ids: ['memento'] }],
    boxes: {
      editor: C('Editor', ['- text: str'], ['+ save(): Memento', '+ restore(m)'], 'The originator. Only it can read what is inside a memento.'),
      history: C('History', ['- stack: List'], ['+ push(m)', '+ pop(): Memento'], 'The caretaker. Stores snapshots but never looks inside them.'),
      memento: C('Memento', ['- text: str'], [], 'A frozen snapshot of the editor’s state.'),
    },
    edges: [['editor', 'memento', 'dep', 'creates'], ['history', 'memento', 'agg', 'keeps *']],
    code: `class Memento:
    def __init__(self, text): self._text = text

class Editor:
    def __init__(self): self.text = ""
    def type(self, s): self.text += s
    def save(self): return Memento(self.text)
    def restore(self, m): self.text = m._text

class History:
    def __init__(self): self.stack = []
    def push(self, m): self.stack.append(m)
    def pop(self): return self.stack.pop()

ed, hist = Editor(), History()
ed.type("Hello");        hist.push(ed.save())
ed.type(" world");       hist.push(ed.save())
ed.type(" !!!typo!!!")
print("Now:     ", repr(ed.text))
hist.pop(); ed.restore(hist.stack[-1])
print("Undo:    ", repr(ed.text))
ed.restore(hist.pop())
print("Undo:    ", repr(ed.text))
` });

  add({ key: 'observer', name: 'Observer', cat: 'Behavioral',
    intent: 'When one object changes, everyone subscribed is notified automatically.',
    when: 'Events and notifications: a new video, a price change, a UI update.',
    tip: 'One upload, many reactions: subscribers come and go freely.',
    rows: [{ ids: ['subj', 'sub'], gap: 90 }, { ids: ['email', 'push'], gap: 30, under: 'sub' }],
    boxes: {
      subj: C('YouTubeChannel', ['- subscribers: List'], ['+ subscribe(s): void', '+ upload(video): void'], 'The subject. When a video is uploaded it loops over its subscribers and calls update() on each one.'),
      sub: I('Subscriber', ['+ update(video): void'], 'Anything that wants to hear about new videos implements this one method.'),
      email: C('EmailAlert', [], ['+ update(v)'], 'Sends an email. The channel neither knows nor cares how.'),
      push: C('PushAlert', [], ['+ update(v)'], 'Sends a push notification. Added without changing YouTubeChannel at all.'),
    },
    edges: [['subj', 'sub', 'assoc', 'notifies *'], ['email', 'sub', 'realize'], ['push', 'sub', 'realize']],
    code: `from abc import ABC, abstractmethod

class Subscriber(ABC):
    @abstractmethod
    def update(self, video: str): ...

class EmailAlert(Subscriber):
    def __init__(self, email): self.email = email
    def update(self, video): print(f"Email to {self.email}: new video '{video}'")

class PushAlert(Subscriber):
    def update(self, video): print(f"Push: '{video}' is live")

class YouTubeChannel:
    def __init__(self):
        self.subscribers = []

    def subscribe(self, s: Subscriber):
        self.subscribers.append(s)

    def upload(self, video: str):
        print(f"Uploading '{video}'...")
        for s in self.subscribers:
            s.update(video)

channel = YouTubeChannel()
channel.subscribe(EmailAlert("priya@example.com"))
channel.subscribe(PushAlert())
channel.upload("Observer Pattern in Hindi")
` });

  add({ key: 'state', name: 'State', cat: 'Behavioral',
    intent: 'An object changes its behaviour when its internal state changes.',
    when: 'Anything with clear states and rules: vending machines, orders, traffic lights.',
    tip: 'No giant if/else: each state class handles the actions.',
    rows: [{ ids: ['vm', 'state'], gap: 80 }, { ids: ['idle', 'coin', 'sold'], gap: 16, under: 'state' }],
    boxes: {
      vm: C('VendingMachine', ['- state: State'], ['+ insert_coin()', '+ press()'], 'The context. It forwards every action to its current state object.'),
      state: I('State', ['+ insert_coin(vm)', '+ press(vm)'], 'One method per action the machine supports.'),
      idle: C('Idle', [], ['+ insert_coin()'], 'Accepts a coin and switches the machine to HasCoin.'),
      coin: C('HasCoin', [], ['+ press()'], 'Dispenses on press and switches to Sold.'),
      sold: C('Sold', [], ['+ press()'], 'Waits for the item to be collected, then back to Idle.'),
    },
    edges: [['vm', 'state', 'assoc', 'current'], ['idle', 'state', 'realize'], ['coin', 'state', 'realize'], ['sold', 'state', 'realize']],
    code: `class Idle:
    def insert_coin(self, vm): print("  coin accepted"); vm.state = HasCoin()
    def press(self, vm): print("  insert a coin first")

class HasCoin:
    def insert_coin(self, vm): print("  already have a coin")
    def press(self, vm): print("  dispensing chips..."); vm.state = Sold()

class Sold:
    def insert_coin(self, vm): print("  wait, still dispensing")
    def press(self, vm): print("  item collected"); vm.state = Idle()

class VendingMachine:
    def __init__(self): self.state = Idle()
    def insert_coin(self): self.state.insert_coin(self)
    def press(self): self.state.press(self)

vm = VendingMachine()
for action in ["press", "insert_coin", "insert_coin", "press", "press", "press"]:
    print(f"{action:12} [{type(vm.state).__name__}]")
    getattr(vm, action)()
` });

  add({ key: 'strategy', name: 'Strategy', cat: 'Behavioral',
    intent: 'Swap an algorithm at runtime by putting each one behind the same interface.',
    when: 'Several ways to do one thing: pricing rules, sorting, payment methods, routes.',
    tip: 'Swap the pricing rule at runtime: ParkingLot never changes.',
    rows: [{ ids: ['ctx', 'if'], gap: 90 }, { ids: ['a', 'b'], gap: 30, under: 'if' }],
    boxes: {
      ctx: C('ParkingLot', ['- pricing: PricingStrategy'], ['+ fee(hours): int', '+ setPricing(p): void'], 'The context. It holds a PricingStrategy and hands fee() off to it, so it never changes when pricing rules change.'),
      if: I('PricingStrategy', ['+ price(hours): int'], 'The interface every pricing rule implements. ParkingLot only ever talks to this.'),
      a: C('HourlyPricing', [], ['+ price(h): int'], 'One concrete rule: ₹40 per hour.'),
      b: C('FlatRate', [], ['+ price(h): int'], 'Another rule: ₹150 flat. Add a third rule without touching ParkingLot. That is the Open/Closed Principle.'),
    },
    edges: [['ctx', 'if', 'assoc', 'uses'], ['a', 'if', 'realize'], ['b', 'if', 'realize']],
    code: `from abc import ABC, abstractmethod

class PricingStrategy(ABC):
    @abstractmethod
    def price(self, hours: int) -> int: ...

class HourlyPricing(PricingStrategy):
    def price(self, hours): return hours * 40

class FlatRate(PricingStrategy):
    def price(self, hours): return 150

class ParkingLot:
    def __init__(self, pricing: PricingStrategy):
        self.pricing = pricing

    def set_pricing(self, pricing: PricingStrategy):
        self.pricing = pricing

    def fee(self, hours: int) -> int:
        return self.pricing.price(hours)

lot = ParkingLot(HourlyPricing())
print("Weekday, 3 hours:", lot.fee(3))

lot.set_pricing(FlatRate())   # swap the rule at runtime
print("Weekend, 3 hours:", lot.fee(3))
` });

  add({ key: 'template', name: 'Template Method', cat: 'Behavioral', aliases: ['template method', 'template pattern'],
    intent: 'Fix the steps of an algorithm in a base class; let subclasses fill in some steps.',
    when: 'Same overall flow, different details: exporters, report generators, game turns.',
    tip: 'export() never changes; subclasses only write format().',
    rows: [{ ids: ['base'] }, { ids: ['csv', 'json'], gap: 40, under: 'base' }],
    boxes: {
      base: A('DataExporter', [], ['+ export(): final', '# fetch(): rows', '# format(rows): str', '# save(text)'], 'export() calls fetch, format and save in a fixed order. Subclasses cannot change the order, only the steps.'),
      csv: C('CsvExporter', [], ['# format(rows)'], 'Fills in just the format step.'),
      json: C('JsonExporter', [], ['# format(rows)'], 'Another format, same flow for free.'),
    },
    edges: [['csv', 'base', 'inherit'], ['json', 'base', 'inherit']],
    code: `import json
from abc import ABC, abstractmethod

class DataExporter(ABC):
    def export(self):                      # the template method
        rows = self.fetch()
        text = self.format(rows)
        self.save(text)

    def fetch(self):
        return [{"lesson": "Strategy", "views": 1200}, {"lesson": "Observer", "views": 950}]

    @abstractmethod
    def format(self, rows) -> str: ...

    def save(self, text):
        print(f"--- {type(self).__name__} ---")
        print(text)

class CsvExporter(DataExporter):
    def format(self, rows):
        return "\\n".join(["lesson,views"] + [f"{r['lesson']},{r['views']}" for r in rows])

class JsonExporter(DataExporter):
    def format(self, rows):
        return json.dumps(rows, indent=2)

CsvExporter().export()
JsonExporter().export()
` });

  add({ key: 'visitor', name: 'Visitor', cat: 'Behavioral',
    intent: 'Add new operations to a set of classes without editing those classes.',
    when: 'Stable class hierarchy, growing list of operations: tax, export, rendering.',
    tip: 'New operation = new visitor. Items stay untouched.',
    rows: [{ ids: ['item', 'visitor'], gap: 100 }, { ids: ['book', 'fruit', 'tax'], gap: 24 }],
    boxes: {
      item: I('Item', ['+ accept(v: Visitor)'], 'Each item calls back the visitor method meant for its own type (double dispatch).'),
      visitor: I('Visitor', ['+ visit_book(b)', '+ visit_fruit(f)'], 'One method per item type.'),
      book: C('Book', ['- price'], ['+ accept(v)'], 'accept() calls v.visit_book(self).'),
      fruit: C('Fruit', ['- price_per_kg', '- kg'], ['+ accept(v)'], 'accept() calls v.visit_fruit(self).'),
      tax: C('GstVisitor', [], ['+ visit_book()', '+ visit_fruit()'], 'One operation (GST) for every item type. Add ShippingVisitor without touching Book or Fruit.'),
    },
    edges: [['item', 'visitor', 'dep', 'accepts'], ['book', 'item', 'realize'], ['fruit', 'item', 'realize'], ['tax', 'visitor', 'realize']],
    code: `class Book:
    def __init__(self, price): self.price = price
    def accept(self, v): return v.visit_book(self)

class Fruit:
    def __init__(self, per_kg, kg): self.per_kg, self.kg = per_kg, kg
    def accept(self, v): return v.visit_fruit(self)

class GstVisitor:
    def visit_book(self, b): return round(b.price * 0.00, 2)          # books: 0% GST
    def visit_fruit(self, f): return round(f.per_kg * f.kg * 0.05, 2) # fruit: 5%

class PriceVisitor:
    def visit_book(self, b): return b.price
    def visit_fruit(self, f): return f.per_kg * f.kg

cart = [Book(499), Fruit(120, 2.5), Book(350)]
print("Subtotal:", sum(i.accept(PriceVisitor()) for i in cart))
print("GST:     ", sum(i.accept(GstVisitor()) for i in cart))
` });

  /* ======================= Layout + rendering ======================= */
  const W = 620, M = 10, NAME_H = 34, STEREO_H = 14, LINE = 20, PAD = 12, ROW_GAP = 64;
  const esc = (s) => (window.YTB ? YTB.esc(s) : String(s));
  const tw = (s, px) => s.length * px;
  function sizeBox(b) {
    const nameH = NAME_H + (b.stereo ? STEREO_H : 0);
    const attrH = Math.max(1, b.attrs.length) * LINE + PAD;
    const opH = Math.max(1, b.ops.length) * LINE + PAD;
    const lines = b.attrs.concat(b.ops).map((t) => t.replace('  {static}', ''));
    const w = Math.max(110, tw(b.name, 8.6) + 28, b.stereo ? tw(b.stereo, 7.2) + 34 : 0, ...lines.map((t) => tw(t, 7.85) + 26));
    return { ...b, w: Math.ceil(w), nameH, attrH, opH, h: nameH + attrH + opH };
  }
  function layout(p) {
    const B = {};
    Object.entries(p.boxes).forEach(([id, b]) => { B[id] = { id, ...sizeBox(b) }; });
    let y = 18;
    p.rows.forEach((r) => {
      const ids = r.ids, gap = r.gap ?? 40;
      const rowW = ids.reduce((n, id) => n + B[id].w, 0) + gap * (ids.length - 1);
      let x = (W - 30 - rowW) / 2; // keep ~30px on the right for back-edges
      if (r.under && B[r.under].x != null) x = B[r.under].x + B[r.under].w / 2 - rowW / 2;
      x = Math.max(M, Math.min(x, W - 30 - rowW));
      const h = Math.max(...ids.map((id) => B[id].h));
      ids.forEach((id) => { B[id].x = Math.round(x); B[id].y = y; x += B[id].w + gap; });
      y += h + ROW_GAP;
    });
    return { B, H: y - ROW_GAP + 26 };
  }
  const HEAD = {
    arrow: (x, y, d) => { const [a, b] = { down: [[-7, -12], [7, -12]], up: [[-7, 12], [7, 12]], left: [[12, -7], [12, 7]], right: [[-12, -7], [-12, 7]] }[d]; return `<path class="ln" d="M${x + a[0]} ${y + a[1]} L${x} ${y} L${x + b[0]} ${y + b[1]}"/>`; },
    tri: (x, y, d) => { const p = { up: [[-9, 15], [9, 15]], down: [[-9, -15], [9, -15]], left: [[15, -9], [15, 9]], right: [[-15, -9], [-15, 9]] }[d]; return `<path class="tri" d="M${x} ${y} L${x + p[0][0]} ${y + p[0][1]} L${x + p[1][0]} ${y + p[1][1]} Z"/>`; },
    diamond: (x, y, d, fill) => { const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d]; const [dx, dy] = v, px = -dy, py = dx; return `<path class="${fill ? 'dia-f' : 'tri'}" d="M${x} ${y} L${x + dx * 9 + px * 6} ${y + dy * 9 + py * 6} L${x + dx * 18} ${y + dy * 18} L${x + dx * 9 - px * 6} ${y + dy * 9 - py * 6} Z"/>`; },
  };
  function edgesSvg(p, B) {
    const out = [];
    const es = p.edges.map(([from, to, type, label, side]) => ({ from, to, type, label, side }));
    // group vertical edges that share a target (fan-in) or a source (fan-out) so they share a trunk
    const inGroups = {}, outGroups = {};
    es.forEach((e) => {
      const a = B[e.from], b = B[e.to];
      if (e.type === 'loop' || e.side) return;
      const overlapV = a.y < b.y + b.h && b.y < a.y + a.h;
      if (overlapV) { e.kind = 'h'; return; }
      e.kind = 'v'; e.dirDown = b.y > a.y;
      (inGroups[e.to + (e.dirDown ? 'd' : 'u') + (e.type === 'realize' || e.type === 'inherit' ? 'tri' : 'arrow')] ||= []).push(e);
    });
    Object.values(inGroups).forEach((g) => { if (g.length === 1) { const e = g[0]; (outGroups[e.from + (e.dirDown ? 'd' : 'u')] ||= []).push(e); } else g.forEach((e) => (e.fanIn = g)); });
    Object.values(outGroups).forEach((g) => { if (g.length > 1) g.forEach((e) => (e.fanOut = g)); });
    const drawn = new Set();
    es.forEach((e) => {
      const a = B[e.from], b = B[e.to];
      const dash = e.type === 'dep' || e.type === 'realize' ? ' dash' : '';
      const head = e.type === 'realize' || e.type === 'inherit' ? 'tri' : 'arrow';
      const attrs = `class="edge" data-from="${e.from}" data-to="${e.to}"`;
      let g = '';
      if (e.type === 'loop') {
        const x = a.x + a.w, y1 = a.y + 18, y2 = a.y + 44;
        g = `<path class="ln" d="M${x} ${y1} H${x + 22} V${y2} H${x}"/>${HEAD.arrow(x, y2, 'left')}<text class="mut" x="${x + 26}" y="${(y1 + y2) / 2 + 4}">${esc(e.label || '')}</text>`;
      } else if (e.side) {
        const sx = a.x + a.w, sy = a.y + Math.min(26, a.h / 2), tx = b.x + b.w, ty = b.y + Math.min(30, b.h / 2);
        const X = Math.max(sx, tx) + 20;
        g = `<path class="ln${dash}" d="M${sx + (e.type === 'agg' || e.type === 'comp' ? 18 : 0)} ${sy} H${X} V${ty} H${tx + 1}"/>${HEAD.arrow(tx, ty, 'left')}${e.type === 'agg' || e.type === 'comp' ? HEAD.diamond(sx, sy, 'right', e.type === 'comp') : ''}<text class="mut" x="${X + 5}" y="${(sy + ty) / 2}" text-anchor="middle" transform="rotate(90 ${X + 5} ${(sy + ty) / 2})">${esc(e.label || '')}</text>`;
      } else if (e.kind === 'h') {
        const leftToRight = a.x < b.x;
        const y = Math.max(a.y, b.y) + (Math.min(a.h, b.h) > 60 ? 28 : Math.min(a.h, b.h) / 2);
        const x1 = leftToRight ? a.x + a.w : a.x, x2 = leftToRight ? b.x : b.x + b.w;
        const dia = e.type === 'agg' || e.type === 'comp';
        const sx = dia ? x1 + (leftToRight ? 18 : -18) : x1;
        const mid = (x1 + x2) / 2;
        g = `<line class="ln${dash}" x1="${sx}" y1="${y}" x2="${x2}" y2="${y}"/>${HEAD[head](x2, y, leftToRight ? 'right' : 'left')}${dia ? HEAD.diamond(x1, y, leftToRight ? 'right' : 'left', e.type === 'comp') : ''}${e.label ? `<text class="mut" x="${mid}" y="${y - 8}" text-anchor="middle">${esc(e.label)}</text>` : ''}`;
      } else {
        const down = e.dirDown;
        const grp = e.fanIn || e.fanOut;
        let sx = a.x + a.w / 2, ex = b.x + b.w / 2;
        const sy = down ? a.y + a.h : a.y, ey = down ? b.y : b.y + b.h;
        let midY;
        if (e.fanIn) {
          const near = down ? Math.max(...e.fanIn.map((x) => B[x.from].y + B[x.from].h)) : Math.min(...e.fanIn.map((x) => B[x.from].y));
          midY = (near + ey) / 2 + (down ? 4 : -4);
        } else if (e.fanOut) {
          const near = down ? Math.min(...e.fanOut.map((x) => B[x.to].y)) : Math.max(...e.fanOut.map((x) => B[x.to].y + B[x.to].h));
          midY = (sy + near) / 2;
        } else midY = (sy + ey) / 2;
        const dia = e.type === 'agg' || e.type === 'comp';
        const s0 = dia ? sy + (down ? 18 : -18) : sy;
        const endY = head === 'tri' ? ey + (down ? -15 : 15) : ey;
        g = `<path class="ln${dash}" d="M${sx} ${s0} V${midY} H${ex} V${endY}"/>`;
        const hk = e.to + (down ? 'd' : 'u') + head;
        if (!(e.fanIn && drawn.has(hk))) { g += HEAD[head](ex, ey, down ? 'down' : 'up'); drawn.add(hk); }
        if (dia) g += HEAD.diamond(sx, sy, down ? 'down' : 'up', e.type === 'comp');
        if (e.label) {
          const lx = (e.fanIn ? sx : ex) + 7, ly = e.fanIn ? (s0 + midY) / 2 + 4 : (midY + endY) / 2 + 4;
          g += `<text class="mut" x="${lx}" y="${ly}">${esc(e.label)}</text>`;
        }
      }
      out.push(`<g ${attrs}>${g}</g>`);
    });
    return out.join('');
  }
  function boxSvg(b, i, anim) {
    const d = anim ? `style="animation-delay:${0.05 + i * 0.08}s"` : '';
    const cx = b.x + b.w / 2, y1 = b.y + b.nameH, y2 = y1 + b.attrH;
    const iface = b.iface ? ' iface' : '', abs = b.stereo === 'abstract';
    const lines = (arr, y0) => arr.map((t, k) => {
      const st = t.includes('{static}');
      return `<text x="${b.x + 12}" y="${y0 + 18 + k * LINE}" ${st ? 'text-decoration="underline"' : ''}>${esc(t.replace('  {static}', ''))}</text>`;
    }).join('');
    return `<g class="cls" data-id="${b.id}" tabindex="0" role="button" aria-label="${esc(b.name)}: ${esc(b.info || '')}">
      <rect class="box${iface}${anim ? ' draw' : ''}" pathLength="1" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="3" ${d}/>
      <line class="rule${iface}${anim ? ' draw' : ''}" pathLength="1" x1="${b.x}" y1="${y1}" x2="${b.x + b.w}" y2="${y1}" ${d}/>
      <line class="rule${iface}${anim ? ' draw' : ''}" pathLength="1" x1="${b.x}" y1="${y2}" x2="${b.x + b.w}" y2="${y2}" ${d}/>
      <g class="${anim ? 'fade' : ''}" style="animation-delay:${0.35 + i * 0.08}s">
        ${b.stereo ? `<text class="st" x="${cx}" y="${b.y + 16}" text-anchor="middle">«${esc(b.stereo)}»</text>` : ''}
        <text class="nm${b.iface ? ' acc' : ''}" x="${cx}" y="${b.y + (b.stereo ? 36 : 22)}" text-anchor="middle" ${abs ? 'font-style="italic"' : ''}>${esc(b.name)}</text>
        ${lines(b.attrs, y1)}${lines(b.ops, y2)}
      </g>
    </g>`;
  }
  function render(p, anim = true) {
    const { B, H } = layout(p);
    const boxes = Object.values(B);
    return { svg: edgesSvg(p, B).replace(/<g class="edge"/g, `<g class="edge${anim ? ' fade' : ''}" style="animation-delay:.6s"`) + boxes.map((b, i) => boxSvg(b, i, anim)).join(''), height: H, B };
  }
  const b64url = (s) => YTB.b64url(s);

  /* The lesson about a pattern: the first lesson whose title best matches this pattern (by name, see YTB.match). */
  let lessons = null;
  async function lessonFor(p, root = '') {
    if (!lessons) {
      lessons = [];
      try { (await YTB.getCourses()).forEach((c) => (c.sections || []).forEach((s) => s.lessons.forEach((l) => { if (l.youtube) lessons.push({ c: c.slug, v: l.youtube, title: l.title }); }))); } catch {}
    }
    const keys = (x) => [x.name, ...(x.aliases || [])];
    const hit = lessons.find((l) => YTB.match(l.title, P, keys) === p);
    return hit ? `${root}courses/watch.html?c=${encodeURIComponent(hit.c)}&v=${encodeURIComponent(hit.v)}` : null;
  }

  /* Interactive mount: svg + info box; hover/focus highlights a class and its edges. */
  function mount({ svg, info, onShow }) {
    let cur = null;
    const tipHtml = () => `<span class="tip">${esc(cur.tip)} Hover a class to see its role.</span>`;
    function show(key, anim = true) {
      cur = P.find((x) => x.key === key) || P[0];
      const r = render(cur, anim);
      svg.setAttribute('viewBox', `0 0 ${W} ${r.height}`);
      svg.innerHTML = `<title>UML class diagram of the ${esc(cur.name)} pattern</title>` + r.svg;
      svg.classList.remove('dim');
      info.innerHTML = tipHtml();
      onShow && onShow(cur);
    }
    function focus(id) {
      const b = cur.boxes[id]; if (!b) return;
      svg.classList.add('dim');
      svg.querySelectorAll('.cls').forEach((g) => g.classList.toggle('hl', g.dataset.id === id));
      svg.querySelectorAll('.edge').forEach((g) => {
        const on = g.dataset.from === id || g.dataset.to === id;
        g.classList.toggle('hl', on);
        if (on) [g.dataset.from, g.dataset.to].forEach((x) => svg.querySelector(`.cls[data-id="${x}"]`)?.classList.add('hl'));
      });
      info.innerHTML = `<b>${esc(b.name)}</b> ${esc(b.info || '')}`;
    }
    const clear = () => { svg.classList.remove('dim'); svg.querySelectorAll('.hl').forEach((n) => n.classList.remove('hl')); info.innerHTML = tipHtml(); };
    svg.addEventListener('mouseover', (e) => { const g = e.target.closest('.cls'); if (g) focus(g.dataset.id); });
    svg.addEventListener('mouseleave', clear);
    svg.addEventListener('focusin', (e) => { const g = e.target.closest('.cls'); if (g) focus(g.dataset.id); });
    svg.addEventListener('click', (e) => { const g = e.target.closest('.cls'); if (g) focus(g.dataset.id); });
    return { show, get current() { return cur; } };
  }

  const CSS = `
  svg .box{fill:var(--panel);stroke:var(--text);stroke-width:1.6}
  svg .box.iface{stroke:var(--accent);stroke-width:2}
  svg .rule{stroke:var(--text);stroke-width:1.6}
  svg .rule.iface{stroke:var(--accent);stroke-width:2}
  svg .ln{stroke:var(--text);stroke-width:1.6;fill:none}
  svg .dash{stroke-dasharray:6 5}
  svg .tri{fill:var(--panel);stroke:var(--text);stroke-width:1.6;stroke-linejoin:round}
  svg .dia-f{fill:var(--text);stroke:var(--text);stroke-width:1.6;stroke-linejoin:round}
  svg text{font-family:var(--mono);font-size:13px;fill:var(--text)}
  svg text.nm{font-weight:600;font-size:14px}
  svg text.st{fill:var(--muted);font-size:11.5px}
  svg text.mut{fill:var(--muted);font-size:12.5px}
  svg text.acc{fill:var(--accent)}
  svg .cls{cursor:pointer}
  svg .cls .box{transition:stroke-width .12s,fill .12s}
  svg .cls:hover .box,svg .cls.hl .box{fill:var(--panel2);stroke-width:2.4}
  svg .cls:focus{outline:none}
  svg.dim .cls:not(.hl),svg.dim .edge:not(.hl){opacity:.3;transition:opacity .15s}
  svg .edge.hl .ln,svg .edge.hl path{stroke:var(--accent)}
  svg .edge.hl text{fill:var(--accent)}
  .draw{stroke-dasharray:1;stroke-dashoffset:1;animation:pdraw .8s ease forwards}
  .fade{opacity:0;animation:pfade .45s ease forwards}
  @keyframes pdraw{to{stroke-dashoffset:0}}
  @keyframes pfade{to{opacity:1}}
  @media (prefers-reduced-motion:reduce){.draw{stroke-dashoffset:0;animation:none}.fade{opacity:1;animation:none}}`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  window.YTBPatterns = { list: P, cats: ['Creational', 'Structural', 'Behavioral'], render, mount, b64url, lessonFor, esc };
})();

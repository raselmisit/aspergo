// ASPER GO Dynamic Pixel & Marketing Tracker (Meta / TikTok / Google / Custom)
import { api } from '../api';

class PixelTracker {
  constructor() {
    this.initialized = false;
    this.settings = {};
  }

  async init() {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      const res = await api.getSettings();
      this.settings = res.settings || {};
      this.injectPixels();
      this.initialized = true;
    } catch (err) {
      console.warn('Pixel initialization deferred:', err);
    }
  }

  injectPixels() {
    const {
      pixel_meta_id,
      pixel_tiktok_id,
      pixel_google_tag_id,
      custom_header_scripts,
      custom_body_scripts
    } = this.settings;

    // 1. Meta (Facebook) Pixel
    if (pixel_meta_id && !window.fbq) {
      /* eslint-disable */
      (function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)})(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */

      window.fbq('init', pixel_meta_id);
      window.fbq('track', 'PageView');
    }

    // 2. TikTok Pixel
    if (pixel_tiktok_id && !window.ttq) {
      /* eslint-disable */
      (function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      })(window, document, 'ttq');
      /* eslint-enable */

      window.ttq.load(pixel_tiktok_id);
      window.ttq.page();
    }

    // 3. Google Tag / GA4
    if (pixel_google_tag_id && !window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${pixel_google_tag_id}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', pixel_google_tag_id);
    }

    // 4. Custom Header Scripts
    if (custom_header_scripts && !document.getElementById('aspergo-custom-header')) {
      const div = document.createElement('div');
      div.id = 'aspergo-custom-header';
      div.innerHTML = custom_header_scripts;
      document.head.appendChild(div);
    }

    // 5. Custom Body Scripts
    if (custom_body_scripts && !document.getElementById('aspergo-custom-body')) {
      const div = document.createElement('div');
      div.id = 'aspergo-custom-body';
      div.innerHTML = custom_body_scripts;
      document.body.appendChild(div);
    }
  }

  // Standard Events
  trackPageView(pageTitle) {
    if (window.fbq) window.fbq('track', 'PageView');
    if (window.ttq) window.ttq.page();
    if (window.gtag) window.gtag('event', 'page_view', { page_title: pageTitle });
  }

  trackViewContent(product) {
    if (!product) return;
    const price = Number(product.discount_price || product.price || 0);

    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.title,
        content_ids: [String(product.id)],
        content_type: 'product',
        value: price,
        currency: 'BDT'
      });
    }

    if (window.ttq) {
      window.ttq.track('ViewContent', {
        content_id: String(product.id),
        content_name: product.title,
        value: price,
        currency: 'BDT'
      });
    }

    if (window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'BDT',
        value: price,
        items: [{ item_id: String(product.id), item_name: product.title, price }]
      });
    }
  }

  trackAddToCart(item) {
    if (!item) return;
    const price = Number(item.unit_price || item.discount_price || item.price || 0);
    const qty = Number(item.quantity || 1);
    const total = price * qty;

    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: item.title,
        content_ids: [String(item.id || item.product_id)],
        content_type: 'product',
        value: total,
        currency: 'BDT'
      });
    }

    if (window.ttq) {
      window.ttq.track('AddToCart', {
        content_id: String(item.id || item.product_id),
        content_name: item.title,
        value: total,
        currency: 'BDT',
        quantity: qty
      });
    }

    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'BDT',
        value: total,
        items: [{ item_id: String(item.id || item.product_id), item_name: item.title, price, quantity: qty }]
      });
    }
  }

  trackInitiateCheckout(items = [], subtotal = 0) {
    const contentIds = items.map(i => String(i.id || i.product_id));

    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: contentIds,
        content_type: 'product',
        num_items: items.length,
        value: subtotal,
        currency: 'BDT'
      });
    }

    if (window.ttq) {
      window.ttq.track('InitiateCheckout', {
        content_ids: contentIds,
        value: subtotal,
        currency: 'BDT'
      });
    }

    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'BDT',
        value: subtotal,
        items: items.map(i => ({
          item_id: String(i.id || i.product_id),
          item_name: i.title,
          price: i.unit_price || i.price,
          quantity: i.quantity || 1
        }))
      });
    }
  }

  trackPurchase(order) {
    if (!order) return;
    const total = Number(order.total_amount || 0);

    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: total,
        currency: 'BDT',
        order_id: order.order_number
      });
    }

    if (window.ttq) {
      window.ttq.track('CompletePayment', {
        value: total,
        currency: 'BDT',
        order_id: order.order_number
      });
    }

    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.order_number,
        value: total,
        currency: 'BDT',
        shipping: order.delivery_fee || 60
      });
    }
  }
}

export const pixelTracker = new PixelTracker();

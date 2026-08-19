import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { SKU_CATALOG, getLocalizedSkuName, getLocalizedSkuUnit } from '../constants/skus';
import { DollarSign, ShoppingBag, ArrowRightLeft, Building2 } from 'lucide-react';

export const MarketPanel: React.FC = () => {
  const { inventory, credits, sellResource, sellAllResources, t, language } = useGameStore();

  const totalValue = Object.entries(inventory).reduce((acc, [sku, amount]) => {
    const skuDef = SKU_CATALOG[sku];
    return acc + (skuDef ? skuDef.baseValue * amount : 0);
  }, 0);

  const availableSkus = Object.values(SKU_CATALOG).filter(
    (skuItem) => (inventory[skuItem.sku] || 0) > 0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{t('current_balance')}</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', fontFamily: 'Fira Code, monospace' }}>
            ${credits.toLocaleString()}
          </span>
        </div>
        <button
          onClick={sellAllResources}
          disabled={totalValue <= 0}
          className="ui-btn ui-btn-primary"
          style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', opacity: totalValue <= 0 ? 0.4 : 1 }}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t('sell_all_depot')} (+${totalValue.toLocaleString()})</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
          {t('live_ore_market')}
        </div>
        <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>
          {t('field_cargo_note')}
        </span>
      </div>

      {/* SKU Market Cards Grid */}
      {availableSkus.length === 0 ? (
        <div
          className="sku-card"
          style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px dashed #334155',
          }}
        >
          <Building2 style={{ width: '32px', height: '32px', color: '#38bdf8', margin: '0 auto 0.5rem auto' }} />
          <h4 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
            {t('empty_depot_title')}
          </h4>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto', lineHeight: '1.4' }}>
            {t('empty_depot_desc')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {availableSkus.map((skuItem) => {
            const count = inventory[skuItem.sku] || 0;
            const stackValue = count * skuItem.baseValue;
            const localizedName = getLocalizedSkuName(skuItem, language);
            const localizedUnit = getLocalizedSkuUnit(skuItem.unit, language);

            return (
              <div
                key={skuItem.sku}
                className="sku-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: skuItem.color }}
                      />
                      <h4 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.8rem' }}>
                        {localizedName}
                      </h4>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'Fira Code, monospace', color: '#64748b', display: 'block', marginTop: '2px' }}>
                      {t('unit_price')}: ${skuItem.baseValue} / {localizedUnit}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0', display: 'block', fontFamily: 'Fira Code, monospace' }}>
                      {count.toLocaleString()} {localizedUnit}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', fontFamily: 'Fira Code, monospace' }}>
                      ${stackValue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => sellResource(skuItem.sku, 10)}
                    className="ui-btn ui-btn-secondary"
                    style={{ padding: '0.35rem', fontSize: '0.7rem', justifyContent: 'center' }}
                  >
                    <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                    <span>{t('sell_10')}</span>
                  </button>
                  <button
                    onClick={() => sellResource(skuItem.sku, count)}
                    className="ui-btn ui-btn-cyan"
                    style={{ padding: '0.35rem', fontSize: '0.7rem', justifyContent: 'center' }}
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>{t('sell_all')} (+${stackValue.toLocaleString()})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

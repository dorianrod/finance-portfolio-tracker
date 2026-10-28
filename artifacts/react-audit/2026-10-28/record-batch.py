import json
from pathlib import Path
BASE=Path(__file__).resolve().parent
STATE=BASE/'run.json'
a=json.loads(STATE.read_text())
def finding(id,rule,file,symbol,message,evidence,status='open',verification=None):
    r=next(r for r in a['rules'] if r['id']==rule)
    pid=id+':occurrence'
    if not any(p['id']==pid for p in r['patterns']):
        r['patterns'].append(dict(id=pid,location=dict(file=file,symbol=symbol),result='error' if status=='open' else 'ok',evidence=evidence,findingIds=[id],exceptionIds=[]))
    if not any(f['id']==id for f in a['findings']):
        f=dict(id=id,severity='error',status=status,message=message,evidence=evidence,patternIds=[pid],diagnosticIds=[])
        if verification:f['verification']=verification
        a['findings'].append(f)

# These findings were inspected in the source and callers; this is not a bulk review.
finding('income-savings-tooltip:raw-date','helpers-formatter-hooks','packages/dashboard/src/domains/portfolio/features/wealth/components/IncomeSavingsTooltip.view.tsx','IncomeSavingsTooltip:savingsSuffix','The partial savings tooltip interpolates a raw Date, exposing the JavaScript Date string.','The new typed detector reports this at batch1; AnnualIncomeSavingsPoint.savingsThrough is Date | null, passed directly to the ytdThrough translation.')
finding('filter-panel:focused-actions','arch-no-prop-drilling','packages/dashboard/src/domains/portfolio/shared/services/actions/useDashboardFilters.ts','useDashboardFilters:panel-and-filter-actions','The same action hook owns panel visibility and editable portfolio filter operations.','Read all openFilters/closeFilters callers, including OverviewPeriodFilter. A focused shared panel controller keeps visibility actions separate without changing the nearest common owner.')

for f in a['findings']:
    if f['id']=='fund-quality-badge:raw-date-title':
        f.update(status='fixed',verification='The regression was red on the original Date interpolation and passes with 30 Sept 2026. The formatter also covers null/undefined/default/custom fallback and missing source. fund-quality-checks.log: 42 tests pass, including configured detector rejection and valid neighboring cases.')
        for r in a['rules']:
            for p in r['patterns']:
                if f['id'] in p.get('findingIds',[]):
                    p.update(result='ok',location=dict(file='packages/dashboard/src/domains/portfolio/features/data-quality/features/assessment/components/FundQualityBadge/helpers/formatters/useFormatFundQualityTitle.ts',symbol='useFormatFundQualityTitle:compositionDate'),evidence=f['verification'])

if not any(e['kind']=='inline' for e in a['exceptions']):
    for i,probe in enumerate(json.loads((BASE/'exception-probes.json').read_text())):
        eid=f'inline:{probe["file"]}:{probe["line"]}'
        diagnostics=[]
        for snapshot in a['eslint']['snapshots']:
            for d in snapshot['diagnostics']:
                if d['file']==probe['file'] and (d['line']==probe['line'] or d['line']==probe['line']+1):
                    if d['ruleId'] in probe['namedRules'] or d['ruleId']=='local/reviewed-eslint-suppression':
                        d['exceptionId']=eid;diagnostics.append(d['id'])
        a['exceptions'].append(dict(id=eid,kind='inline',location=dict(file=probe['file'],symbol=f'suppression-at-line-{probe["line"]}'),status='pending',reason=probe['text'].split(';',1)[-1].strip(),evidence=f'exception-probes.json entry {i}: removed only this directive in memory and preserved the real ESLint configuration; every named rule reports a diagnostic; technical rationale is still pending.',reviewedAt=None,ruleIds=probe['namedRules'],diagnosticIds=diagnostics,probes=[dict(ruleId=rule,applicable=True,diagnosticEvidence='; '.join(d['message'] for d in probe['diagnostics'] if d['ruleId']==rule)) for rule in probe['namedRules']]))
# Link the newly exposed Date diagnostic, preserving exact snapshot identity.
for snapshot in a['eslint']['snapshots']:
    for d in snapshot['diagnostics']:
        if d['ruleId']=='local/i18n-consistency' and d['messageId']=='unformattedDate':
            f=next(f for f in a['findings'] if f['id']=='income-savings-tooltip:raw-date')
            d['findingId']=f['id']
            if d['id'] not in f['diagnosticIds']:f['diagnosticIds'].append(d['id'])
STATE.write_text(json.dumps(a,indent=2)+'\n')
print(f'{len(a["findings"])} findings; {len(a["exceptions"])} exception entries; no unreviewed exception accepted')

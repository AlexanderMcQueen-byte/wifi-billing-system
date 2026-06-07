; MikroTik RouterOS import script for WiFi Billing minimal protections
; Edit placeholders (HOTSPOT_INTERFACE, DHCP_SERVER_NAME, DHCP_NETWORK) before importing

; Ensure hotspot user profile enforces one device per user
/:if ([:len [/ip/hotspot/user/profile/print where name="default"]] = 1) do={/ip/hotspot/user/profile/set [find name="default"] shared-users=1}

; DHCP server settings - enable add-arp on the DHCP server (replace DHCP_SERVER_NAME)
; /ip/dhcp-server/set [find name="DHCP_SERVER_NAME"] add-arp=yes

; DHCP network ARP mode - reply-only (replace DHCP_NETWORK address or find the correct network)
; /ip/dhcp-server/network/set [find address="DHCP_NETWORK"] arp=reply-only

; Add anti-tethering TTL mangle (replace HOTSPOT_INTERFACE)
; /ip/firewall/mangle/add chain=prerouting in-interface=HOTSPOT_INTERFACE action=change-ttl new-ttl=1 comment="Anti-tethering TTL limit for hotspot users"

; Guidance:
; 1. Upload this file to the router's files and run `/import wifi-billing-setup.rsc` from CLI or Winbox
; 2. Replace placeholders before importing
; 3. Review changes after import and adjust to your network layout

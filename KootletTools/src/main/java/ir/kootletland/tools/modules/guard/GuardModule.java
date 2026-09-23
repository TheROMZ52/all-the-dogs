package ir.kootletland.tools.modules.guard;
import io.papermc.paper.event.player.PlayerStonecutterRecipeSelectEvent;
import ir.kootletland.tools.KootletTools;
import ir.kootletland.tools.core.Text;
import ir.kootletland.tools.core.ToolModule;
import net.kyori.adventure.text.Component;
import org.bukkit.entity.*;
import org.bukkit.event.*;
import org.bukkit.event.inventory.*;
import org.bukkit.inventory.*;
import org.bukkit.inventory.meta.ItemMeta;
import java.util.*;
public final class GuardModule extends ToolModule {
 private static final String BYPASS="kootlettools.guard.bypass"; private List<String> names=List.of(); private boolean craft,stone,smelt,anvil;
 public GuardModule(KootletTools p){super(p,"guard");}
 protected void onEnable(){names=config.getStringList("protected-names").stream().map(Text::cleanName).filter(x->!x.isEmpty()).toList();craft=config.getBoolean("block.crafting",true);stone=config.getBoolean("block.stonecutter",true);smelt=config.getBoolean("block.smelting",true);anvil=config.getBoolean("block.anvil",true);}
 private boolean protectedItem(ItemStack i){if(i==null||i.getType().isAir()||names.isEmpty())return false;ItemMeta m=i.getItemMeta();if(m==null||!m.hasDisplayName())return false;Component n=m.displayName();if(n==null)return false;String p=Text.plainLower(n);return names.stream().anyMatch(p::contains);}
 private boolean bypass(List<HumanEntity> v){return v.stream().anyMatch(x->x.hasPermission(BYPASS));}
 private void tell(List<HumanEntity> v){Component m=msg("denied");for(HumanEntity x:v)if(x instanceof Player p)p.sendActionBar(m);}
 @EventHandler(priority=EventPriority.HIGH) public void craft(PrepareItemCraftEvent e){if(!craft)return;for(ItemStack i:e.getInventory().getMatrix())if(protectedItem(i)){if(bypass(e.getViewers()))return;e.getInventory().setResult(null);tell(e.getViewers());return;}}
 @EventHandler(ignoreCancelled=true) public void stone(PlayerStonecutterRecipeSelectEvent e){if(stone&&!e.getPlayer().hasPermission(BYPASS)&&protectedItem(e.getStonecutterInventory().getItem(0))){e.setCancelled(true);tell(List.of(e.getPlayer()));}}
 @EventHandler(ignoreCancelled=true) public void smelt(FurnaceSmeltEvent e){if(smelt&&protectedItem(e.getSource()))e.setCancelled(true);}
 @EventHandler(priority=EventPriority.HIGH) public void anvil(PrepareAnvilEvent e){if(!anvil)return;if(protectedItem(e.getInventory().getItem(0))||protectedItem(e.getInventory().getItem(1))){if(bypass(e.getViewers()))return;e.setResult(null);tell(e.getViewers());}}
}
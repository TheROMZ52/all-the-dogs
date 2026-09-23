package ir.kootletland.tools.modules.autosmelt;
import ir.kootletland.tools.KootletTools;
import ir.kootletland.tools.core.ToolModule;
import org.bukkit.*;
import org.bukkit.command.*;
import org.bukkit.entity.*;
import org.bukkit.event.EventHandler;
import org.bukkit.event.block.BlockDropItemEvent;
import org.bukkit.inventory.*;
import java.util.*;
public final class AutoSmeltModule extends ToolModule {
 private boolean defaultOn,requirePermission; private int xpPerItem; private final Map<Material,Material> map=new HashMap<>();
 public AutoSmeltModule(KootletTools p){super(p,"autosmelt");} public List<String> commands(){return List.of("autosmelt");}
 protected void onEnable(){defaultOn=config.getBoolean("default-on",true);requirePermission=config.getBoolean("require-permission",false);xpPerItem=config.getInt("xp-per-item",1);map.clear();var sec=config.getConfigurationSection("blocks");if(sec==null)return;Map<Material,Material> results=new HashMap<>();Iterator<Recipe> it=plugin.getServer().recipeIterator();while(it.hasNext()){Recipe r=it.next();if(r instanceof CookingRecipe<?> cr){Material out=cr.getResult().getType();RecipeChoice ch=cr.getInputChoice();if(ch instanceof RecipeChoice.MaterialChoice mc)for(Material m:mc.getChoices())results.putIfAbsent(m,out);else if(ch instanceof RecipeChoice.ExactChoice ec)for(ItemStack s:ec.getChoices())results.putIfAbsent(s.getType(),out);}}for(String k:sec.getKeys(false)){Material b=Material.matchMaterial(k);if(b==null)continue;String o=sec.getString(k,"");Material out=o==null||o.isBlank()?results.get(b):Material.matchMaterial(o);if(out!=null)map.put(b,out);}}
 private boolean on(Player p){return(!requirePermission||p.hasPermission("kootlettools.autosmelt.use"))&&plugin.getAutoToggles().smelt().isOn(p,defaultOn);}
 @EventHandler(ignoreCancelled=true) public void drop(BlockDropItemEvent e){Player p=e.getPlayer();Material b=e.getBlockState().getType(),out=map.get(b);if(out==null||!worldAllowed(p.getWorld())||!on(p))return;int xp=0;for(Item x:e.getItems()){ItemStack s=x.getItemStack();if(s.getType()!=b)continue;x.setItemStack(new ItemStack(out,s.getAmount()));xp+=xpPerItem*s.getAmount();}if(xp>0)p.getWorld().spawn(p.getLocation(),ExperienceOrb.class,o->o.setExperience(xp));}
 public boolean handleCommand(CommandSender s,Command c,String l,String[] a){if(!(s instanceof Player p)){s.sendMessage(msg("players-only"));return true;}if(requirePermission&&!p.hasPermission("kootlettools.autosmelt.use")){p.sendMessage(msg("no-permission"));return true;}p.sendMessage(msg(plugin.getAutoToggles().smelt().toggle(p,defaultOn)?"on":"off"));return true;}
}
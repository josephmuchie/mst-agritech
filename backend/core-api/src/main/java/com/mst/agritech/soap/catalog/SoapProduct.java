package com.mst.agritech.soap.catalog;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Product", namespace = CatalogNamespace.NS, propOrder = {
        "id", "sku", "name", "description", "category", "supplier", "country",
        "originRegion", "imageUrl", "priceUsd", "currency", "unit", "stock",
        "available", "minOrderQuantity", "leadTimeDays", "incoterms",
        "packaging", "certifications", "hsCode", "unspscCode"
})
public class SoapProduct {
    @XmlElement(namespace = CatalogNamespace.NS)
    private Long id;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String sku;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String name;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String description;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String category;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String supplier;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String country;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String originRegion;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String imageUrl;
    @XmlElement(namespace = CatalogNamespace.NS)
    private BigDecimal priceUsd;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String currency;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String unit;
    @XmlElement(namespace = CatalogNamespace.NS)
    private BigDecimal stock;
    @XmlElement(namespace = CatalogNamespace.NS)
    private Boolean available;
    @XmlElement(namespace = CatalogNamespace.NS)
    private BigDecimal minOrderQuantity;
    @XmlElement(namespace = CatalogNamespace.NS)
    private Integer leadTimeDays;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String incoterms;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String packaging;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String certifications;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String hsCode;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String unspscCode;
}
